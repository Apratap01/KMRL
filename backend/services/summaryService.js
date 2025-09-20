// backend/services/summaryService.js
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

// The URL of your FastAPI server
const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

export async function getSummaryFromFastAPI(file, language,department) {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path));
    formData.append('language', language);
    formData.append('department',department)

    const response = await axios.post(`${FASTAPI_URL}/summarize/`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error hitting FastAPI:', error.message);
    if (error.response) {
      console.error('FastAPI Response Data:', error.response.data);
      console.error('FastAPI Response Status:', error.response.status);
    } else if (error.request) {
      console.error('No response received from FastAPI.');
    }
    throw new Error('Failed to get summary from FastAPI.');
  }
}