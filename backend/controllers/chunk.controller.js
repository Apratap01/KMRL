import { pool } from "../config/db.js";
import { s3 } from "../routes/docs.routes.js";
import axios from "axios";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getChunkFromFastAPI } from "../services/chunkService.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const getConvId = async (req, res) => {
    const docId = req.params.id
    if (!docId) {
        return res.status(400).json({ "message": "Please send docId" })
    }
    const document = await pool.query(`SELECT * FROM docs WHERE id=$1`, [docId])
    if (document.rows.length == 0) {
        return res.status(400).json({ "message": "No doc found" })
    }
    console.log(document.rows[0].conversation_id)
    if (document.rows[0].conversation_id != null) {
        console.log("From beginning")
        return res.status(200).json({ "message": "Conv Id fetched successfully", "data": document.rows[0].conversation_id })
    }
    const fileKey = document.rows[0].file_key
    if (!fileKey) {
        return res.status(404).json({ error: 'Document not found' });
    }
    const getObjectParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey
    };
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    if (!url) {
        return res.status(400).json({ error: 'Signed URL not provided.' });
    }
    const tempFilePath = path.join(process.cwd(), "chunks", `${uuidv4()}.pdf`);

    try {
        const response = await axios({
            url,
            method: "GET",
            responseType: "stream",
        });

        const writer = fs.createWriteStream(tempFilePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
        });

        const ans = await getChunkFromFastAPI({ path: tempFilePath });
        const conversationId = ans.conversation_id
        console.log(conversationId)

        fs.unlink(tempFilePath, (err) => {
            if (err) console.error("Error deleting temp file:", err);
            else console.log("Temp file deleted:", tempFilePath);
        });

        await pool.query(
            `UPDATE docs SET conversation_id = $1 WHERE id = $2`,
            [conversationId, docId])


        return res.status(200).json({ "message": "Conv Id fetched successfully", "data": conversationId })
    }
    catch (error) {
        console.log("Error in Fetching Conv id")
        return res.send(error.message)
    }
}