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


const FASTAPI_URL = process.env.FASTAPI_URL ||'http://localhost:8000'; // Define FastAPI URL

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
    console.log("file:",req.file)
    console.log("body:",req.body)
    const fileKey = `${Date.now()}_${req.file.originalname}`;

    const params = {
      Bucket: bucketName,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    const userId = req.user.id;
    let lastDate = null; // Initialize lastdate

    // --- NEW: Call FastAPI to extract the last date ---
    try {
      const formData = new FormData();
      formData.append('file', req.file.buffer, req.file.originalname);

      const dateResponse = await axios.post(`${FASTAPI_URL}/extract-last-date/`, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });
      lastDate = dateResponse.data.last_date;
      console.log(FASTAPI_URL)
      console.log(`Extracted last date: ${lastDate}`);
    } catch (llmError) {
      console.error("Error extracting date from document:", llmError.message);
    }
    // --- END NEW ---


    const query = `
      INSERT INTO docs (user_id, title, file_key, file_type)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [userId, req.file.originalname, fileKey, req.file.mimetype];

    const result = await pool.query(query, values);

    // --- NEW: Schedule a task for email notification if a date was found ---
    console.log(typeof (lastDate))
    const isoDate = new Date(lastDate).toISOString();
    if (lastDate) {
      await pool.query(`UPDATE docs SET last_date = $1 WHERE id = $2`, [isoDate, result.rows[0].id])
      // await runTask(userId, result.rows[0].id, lastDate);
    }
    // --- END NEW ---

    const finalResult = await pool.query(`SELECT * FROM docs WHERE id = $1`, [result.rows[0].id])
    return res.status(201).json({
      message: "File uploaded successfully",
      doc: finalResult.rows[0],
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "File upload failed", error: error.message });
  }
});

router.get('/get-all-docs', verifyJWT, async (req, res) => {
  try {
    const userId = req.user.id
    const resultDocs = await pool.query(`SELECT id,title,file_type,uploaded_at,risk_factor FROM docs where user_id = $1`, [userId])
    return res.status(200).json({ "result": resultDocs.rows })
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
    const resultDocs = await pool.query(`SELECT file_key FROM docs WHERE user_id = $1 AND id = $2 `, [userId, docId])
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

