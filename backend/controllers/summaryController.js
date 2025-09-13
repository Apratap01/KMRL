import { getSummaryFromFastAPI } from '../services/summaryService.js';
import axios from 'axios';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { pool } from '../config/db.js';
import { s3 } from '../routes/docs.routes.js';

export async function summarizeDocument(req, res) {
  const { language } = req.body;
  const docId = req.params.id;

  const result = await pool.query(`SELECT file_key,issummarygenerated FROM docs WHERE id=$1 `, [docId])
  const fileKey = result.rows[0]?.file_key;

  const result2 = await pool.query(`SELECT summary,language FROM summaries WHERE doc_id = $1 AND language = $2`, [docId, language])

  if (result2.rows.length > 0) {
    console.log('Summary Already exists')
    return res.status(200).json(result2.rows[0].summary)
  }

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
  if (!language) {
    return res.status(400).json({ error: 'Language not provided.' });
  }

  const tempFilePath = path.join(process.cwd(), "uploads", `${uuidv4()}.pdf`);

  try {
    // Step 1: Download file from signed URL
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

    // Step 2: Call FastAPI service
    const summaryData = await getSummaryFromFastAPI({ path: tempFilePath }, language);

    // Step 3: Insert into summaries table
    const resQuery = `
      INSERT INTO summaries (doc_id, language, summary) 
      VALUES ($1, $2, $3) RETURNING *`;
    const values = [docId, language, summaryData];
    const finalRes = await pool.query(resQuery, values);

    // Step 4: Update docs table with is_summarised = true
    const risk_factor = summaryData.urgency_percentage
    console.log(risk_factor)
    
    await pool.query(
      `UPDATE docs SET issummarygenerated = true WHERE id = $1`,
      [docId]
    );

    await pool.query(
      `UPDATE docs SET risk_factor = $1 WHERE id = $1`,
      [risk_factor]
    );

    res.status(200).json(finalRes.rows[0].summary);
  } catch (error) {
    console.error('Summary API error:', error.message);
    res.status(500).json({ error: 'Failed to process document summary.' });
  } finally {
    try {
      await fsPromises.unlink(tempFilePath);
    } catch (err) {
      console.warn("Could not delete temp file:", err.message);
    }
  }
}

export async function regenerateSummary(req, res) {
  const { language } = req.body
  const docId = req.params.id
  const result = await pool.query(`SELECT file_key,issummarygenerated FROM docs WHERE id=$1 `, [docId])
  const fileKey = result.rows[0]?.file_key;
  if(!language){
    return res.status(400).send('Language not provided')
  }
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
  if (!language) {
    return res.status(400).json({ error: 'Language not provided.' });
  }
  const tempFilePath = path.join(process.cwd(), "uploads", `${uuidv4()}.pdf`);

  try {
    // Step 1: Download file from signed URL
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

    // Step 2: Call FastAPI service
    const summaryData = await getSummaryFromFastAPI({ path: tempFilePath }, language);

    // Step 3: Insert into summaries table
    const resQuery = `UPDATE summaries SET summary = $1 WHERE doc_id = $2 AND language = $3 RETURNING *`

    const finalRes = await pool.query(resQuery,[summaryData.summary,docId,language])

    const finalResult = await pool.query(`SELECT summary from summaries WHERE doc_id =$1 AND language =$2`,[docId,language])

    // console.log(summaryData)
    console.log(finalResult.rows)
    const risk_factor = summaryData.summary.urgency_percentage
    console.log(risk_factor)

    // Step 4: Update docs table with is_summarised = true
    await pool.query(
      `UPDATE docs SET issummarygenerated = true WHERE id = $1`,
      [docId]
    );

    await pool.query(
      `UPDATE docs SET risk_factor = $1 WHERE id = $2`,
      [risk_factor,docId]
    );

    res.status(200).json(finalResult.rows[0].summary);
  } catch (error) {
    console.error('Summary API error:', error.message);
    res.status(500).json({ error: 'Failed to process document summary.' });
  } finally {
    try {
      await fsPromises.unlink(tempFilePath);
    } catch (err) {
      console.warn("Could not delete temp file:", err.message);
    }
  }
}