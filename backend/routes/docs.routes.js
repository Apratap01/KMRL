import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import dotenv from "dotenv";
import { S3Client, PutObjectCommand,GetObjectCommand } from "@aws-sdk/client-s3";
import { pool } from "../config/db.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from 'axios'
import path from 'path'
dotenv.config();
import fs from 'fs'

export const router = Router();

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

    const query = `
      INSERT INTO docs (user_id, title, file_key, file_type)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [userId, req.file.originalname, fileKey, req.file.mimetype];

    const result = await pool.query(query, values);

    return res.status(201).json({
      message: "File uploaded successfully",
      doc: result.rows[0],
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "File upload failed", error: error.message });
  }
});

router.get('/get-all-docs',verifyJWT,async(req,res)=>{
    try {
        const userId = req.user.id
        const resultDocs = await pool.query(`SELECT title,file_type,uploaded_at FROM docs where user_id = $1`,[userId])
        return res.status(200).json({"result":resultDocs.rows})
    } 
    catch (error) {
        console.log(error.message)
        return res.status(500).send('Server error in getting docs')
        
    }
})

router.get('/:id/preview',verifyJWT,async(req,res)=>{
    try {
        const userId = req.user.id
        const docId = req.params.id
        console.log(userId)
        console.log(docId)
        if(!docId){
            return res.status(400).json({"message":"Send id for docs"})
        }
        const resultDocs = await pool.query(`SELECT file_key FROM docs WHERE user_id = $1 AND id = $2 `,[userId,docId])
        const getObjectParams = {
                Bucket:bucketName,
                Key:resultDocs.rows[0].file_key
            }
        console.log(getObjectParams)
        const command = new GetObjectCommand(getObjectParams)
        const url = await getSignedUrl(s3,command,{expiresIn:3600})
        res.status(200).json({"message":"Url sent successfully","url":url})
    } catch (error) {
        console.log(error.message)
    }
})
