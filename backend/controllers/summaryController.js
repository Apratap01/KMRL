import { getSummaryFromFastAPI } from '../services/summaryService.js';
import fs from 'fs/promises';

export async function summarizeDocument(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  if (!req.body.language) {
    await fs.unlink(req.file.path);
    return res.status(400).json({ error: 'Language not provided.' });
  }

  try {
    const summaryData = await getSummaryFromFastAPI(req.file, req.body.language);

    res.status(200).json(summaryData);
  } catch (error) {
    console.error('Summary API error:', error);
    res.status(500).json({ error: 'Failed to process document summary.' });
  } finally {
    await fs.unlink(req.file.path);
  }
}