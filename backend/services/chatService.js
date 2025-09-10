// backend/services/summaryService.js
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

// The URL of your FastAPI server
const FASTAPI_URL = process.env.FASTAPI_URL ||'http://localhost:8000';

export async function getResponseFromFastApi(conversation_id, query) {
  try {
    const response = await axios.post(`${FASTAPI_URL}/chat/`, {
      conversation_id,
      query
    });
    return response.data;
  } catch (error) {
    console.error('Error hitting FastAPI:', error.message);
    throw new Error('Failed to get result of query from FastAPI.');
  }
}
