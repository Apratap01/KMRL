import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import dotenv from "dotenv";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { pool } from "../config/db.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from 'axios'
import path from 'path'
import FormData from "form-data";
import fs from 'fs'



export const router = Router();
dotenv.config();

const bucketName = process.env.AWS_BUCKET_NAME;
const regionName = process.env.AWS_REGION;
const accessKey = process.env.AWS_ACCESS_KEY;
const secretKey = process.env.AWS_SECRET_KEY;

export const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
  region: regionName,
});


const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000'; // Define FastAPI URL

async function downloadFileFromSignedUrl(signedUrl, destPath) {
  const writer = fs.createWriteStream(destPath);
  const response = await axios({
    url: signedUrl,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(destPath));
    writer.on("error", reject);
  });
}

const localFilePath = path.join(process.cwd(), "uploads", "document.pdf");

// upload.single('docs') => "docs" should match <input type="file" name="docs" />
router.post("/upload", verifyJWT, upload.single("docs"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("file:", req.file);
    console.log("body:", req.body);

    const fileKey = `${Date.now()}_${req.file.originalname}`;

    // Upload to S3
    const params = {
      Bucket: bucketName,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };
    const command = new PutObjectCommand(params);
    await s3.send(command);

    const userId = req.user.id;
    let lastDate = null;

    // --- Extract last_date from FastAPI ---
    try {
      const formData = new FormData();
      formData.append("file", req.file.buffer, req.file.originalname);

      const dateResponse = await axios.post(
        `${FASTAPI_URL}/extract-last-date/`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      );
      lastDate = dateResponse.data.last_date;
      console.log(`Extracted last date: ${lastDate}`);
    } catch (llmError) {
      console.error("Error extracting date from document:", llmError.message);
    }

    // --- Save document in docs table ---
    const insertDocQuery = `
      INSERT INTO docs (user_id, title, file_key, file_type)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const docValues = [
      userId,
      req.file.originalname,
      fileKey,
      req.file.mimetype,
    ];

    const result = await pool.query(insertDocQuery, docValues);
    const docId = result.rows[0].id;

    // --- Update last_date if found ---
    if (lastDate) {
      const isoDate = new Date(lastDate).toISOString();
      await pool.query(
        `UPDATE docs SET last_date = $1 WHERE id = $2`,
        [isoDate, docId]
      );
    }

    // --- Call GenAI server to get related departments ---
    let relatedDepartments = [];
    try {
      const formData = new FormData();
      formData.append("file", req.file.buffer, req.file.originalname);

      const genAiResponse = await axios.post(
        `${FASTAPI_URL}/predict-department/`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        }
      );
      console.log(genAiResponse.data)
      relatedDepartments = genAiResponse.data.predicted_departments;
    } catch (genAiError) {
      console.error("Error getting related departments:", genAiError.message);

      // fallback: assign user’s own department
      const userDeptResult = await pool.query(
        `SELECT department FROM users WHERE id = $1`,
        [userId]
      );
      relatedDepartments = [userDeptResult.rows[0].department];
    }
    const department = req.user.department
    const isPresent = relatedDepartments.includes(department)

    if(!isPresent){
      relatedDepartments.push(department)
    }

    // --- Insert into department_docs ---
    for (const dept of relatedDepartments) {
      await pool.query(
        `INSERT INTO department_docs (department, doc_id) VALUES ($1, $2)`,
        [dept, docId]
      );
    }

    // --- Fetch final doc ---
    const finalResult = await pool.query(
      `SELECT * FROM docs WHERE id = $1`,
      [docId]
    );

    return res.status(201).json({
      message: "File uploaded successfully",
      doc: finalResult.rows[0],
      departments: relatedDepartments,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res
      .status(500)
      .json({ message: "File upload failed", error: error.message });
  }
});


router.get('/get-all-docs', verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id
    const resultDocs = await pool.query(`SELECT id,title,file_type,uploaded_at FROM docs where user_id = $1`, [userId])
    return res.status(200).json({ "result": resultDocs.rows })
  }
  catch (error) {
    console.log(error.message)
    return res.status(500).send('Server error in getting docs')

  }
})

router.get('/get-dept-docs', verifyJWT, async (req, res) => {
  try {
    const department = req.user.department
    const result = await pool.query(`SELECT dep.doc_id AS id,d.title,d.file_type,d.uploaded_at FROM department_docs dep JOIN docs d ON dep.doc_id = d.id WHERE dep.department = $1`, [department])
    console.log(result.rows)
    return res.status(200).json({ "result": result.rows })
  }
  catch (error) {
    console.log(error.message)
    return res.status(500).send('Server error in getting docs')
  }
})

router.get('/:id/preview', verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id
    const docId = req.params.id
    console.log(userId)
    console.log(docId)
    if (!docId) {
      return res.status(400).json({ "message": "Send id for docs" })
    }
    const resultDocs = await pool.query(`SELECT file_key FROM docs WHERE id = $1 `, [docId])
    const getObjectParams = {
      Bucket: bucketName,
      Key: resultDocs.rows[0].file_key
    }
    console.log(getObjectParams)
    const command = new GetObjectCommand(getObjectParams)
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 })
    res.status(200).json({ "message": "Url sent successfully", "url": url })
  } catch (error) {
    console.log(error.message)
  }
})

router.post('/:id/delete', verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id;
    const docId = req.params.id;

    if (!docId) {
      return res.status(400).json({ message: "Send id for docs" });
    }

    // Check if document exists for this user
    const result = await pool.query(
      `SELECT * FROM docs WHERE id = $1 AND user_id = $2`,
      [docId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Document not found or not owned by user" });
    }

    const fileKey = result.rows[0].file_key;

    // delete from S3
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
    };
    const command = new DeleteObjectCommand(params);
    await s3.send(command);

    // delete from DB
    const deleteRes = await pool.query(
      `DELETE FROM docs WHERE id = $1 AND user_id = $2`,
      [docId, userId]
    );

    if (deleteRes.rowCount === 0) {
      return res.status(400).json({ message: "Delete failed" });
    }

    return res.status(200).json({ message: "Deleted Successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json("Error deleting document on server");
  }
});

