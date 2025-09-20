# app.py
import os
import uuid
import shutil
import logging
from pathlib import Path
from dotenv import load_dotenv
from typing import Dict, Optional, List, Any
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable not found. Please set it in your .env file.")

from summarizer import generate_document_summary, extract_last_date, predict_department
from models import SummaryResponse, KmrlDocSummary, LastDateResponse, ChatRequest, DepartmentPredictionResponse
from utils import extract_text_from_pdf
from modules.chunking import file_to_chunks
from modules.embedding_store import (
    USE_PINECONE,
    upsert_chunks_to_pinecone,
    PINECONE_INDEX_NAME,
)
from modules.retriever import answer_query
from modules.chatbot import init_chat, add_user_message, add_bot_message

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

db_session: Dict[str, dict] = {}

app = FastAPI()

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to LegalDoc-GenAI FastAPI backend!"}

@app.post("/upload-and-build/")
async def upload_and_build_db(file: UploadFile = File(...)):
    global db_session
    
    filepath = Path("data") / file.filename
    filepath.parent.mkdir(parents=True, exist_ok=True)
    
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)

    try:
        # Generate chunks
        chunks = file_to_chunks(str(filepath))
        if not chunks:
            raise HTTPException(status_code=400, detail="The document is empty or could not be processed.")
        
        # Estimate processing time for user
        estimated_time_minutes = len(chunks) * 4.1 / 60  # 4.1 seconds per chunk
        print(f"Processing {len(chunks)} chunks. Estimated time: {estimated_time_minutes:.1f} minutes")
        
        # Check if chunk count exceeds reasonable free tier usage
        if len(chunks) > 200:
            print(f"Warning: {len(chunks)} chunks will take ~{estimated_time_minutes:.0f} minutes to process with free tier limits")
        
        metadatas = [{"source": file.filename, "chunk_id": str(uuid.uuid4())} for _ in range(len(chunks))]
        conversation_id = str(uuid.uuid4())

        # This will now use Google GenAI embeddings with proper rate limiting
        upsert_chunks_to_pinecone(chunks, metadatas=metadatas, index_name=PINECONE_INDEX_NAME, namespace=conversation_id)
        
        db_session[conversation_id] = {
            "chat_history": init_chat()
        }

        return {
            "message": f"Successfully processed {len(chunks)} chunks and built the vector DB using Google GenAI embeddings.",
            "conversation_id": conversation_id,
            "chunks_count": len(chunks),
            "embedding_model": "Google text-embedding-004",
            "embedding_dimension": 3072
        }
        
    except Exception as e:
        # More specific error handling
        error_msg = str(e)
        if "quota" in error_msg.lower() or "rate limit" in error_msg.lower():
            raise HTTPException(
                status_code=429, 
                detail=f"Google API rate limit exceeded. Please try again later. Original error: {error_msg}"
            )
        elif "api key" in error_msg.lower():
            raise HTTPException(
                status_code=401, 
                detail="Invalid Google API key. Please check your GOOGLE_API_KEY environment variable."
            )
        else:
            raise HTTPException(status_code=500, detail=f"Error processing file: {error_msg}")
    finally:
        # Clean up uploaded file
        if filepath.exists():
            os.remove(filepath)

@app.post("/chat/")
async def chat_with_docs(request: ChatRequest):
    conversation_id = request.conversation_id
    query = request.query

    if not conversation_id:
        raise HTTPException(status_code=400, detail="Missing conversation ID.")

    # If chat history is missing (e.g., after restart), create a fresh one
    if conversation_id not in db_session:
        db_session[conversation_id] = {"chat_history": init_chat()}

    session_data = db_session[conversation_id]
    add_user_message(session_data["chat_history"], query)

    try:
        # 🔑 always query Pinecone using namespace = conversation_id
        answer = answer_query(
            query,
            conversation_id=conversation_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")

    add_bot_message(session_data["chat_history"], answer)

    return {
        "conversation_id": conversation_id,
        "answer": answer,
        "chat_history": session_data["chat_history"]
    }



# --- Summarizer Endpoints ---

@app.post("/summarize/", response_model=SummaryResponse)
async def summarize_document(file: UploadFile = File(...), language: str = Form(...), department: str = Form(...)):
    file_location = f"temp/{file.filename}"
    Path(file_location).parent.mkdir(parents=True, exist_ok=True)
    
    try:
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        document_content = extract_text_from_pdf(file_location)
        if not document_content:
            raise HTTPException(status_code=400, detail="Could not extract text from the document.")

        summary_result: KmrlDocSummary = generate_document_summary(document_content, language, department, GOOGLE_API_KEY)
        
        logger.info("--- Document Summary ---")
        logger.info(summary_result.model_dump_json(indent=2))
        
        return SummaryResponse(
            summary=summary_result,
            is_summarized=True 
        )
    except Exception as e:
        logger.error(f"An internal error occurred: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {e}")
    finally:
        if os.path.exists(file_location):
            os.remove(file_location)

# --- New Endpoint for Department Prediction ---
@app.post("/predict-department/", response_model=DepartmentPredictionResponse)
async def predict_department_endpoint(file: UploadFile = File(...)):
    file_location = f"temp/{file.filename}"
    Path(file_location).parent.mkdir(parents=True, exist_ok=True)
    
    try:
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        document_content = extract_text_from_pdf(file_location)
        if not document_content:
            raise HTTPException(status_code=400, detail="Could not extract text from the document.")

        prediction = predict_department(document_content, GOOGLE_API_KEY)
        
        return prediction
    except Exception as e:
        logger.error(f"An error occurred during department prediction: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal error occurred during department prediction.")
    finally:
        if os.path.exists(file_location):
            os.remove(file_location)



# ---  Endpoint for Date Extraction ---
@app.post("/extract-last-date/", response_model=LastDateResponse)
async def extract_date_from_document(file: UploadFile = File(...)):
    """
    Extracts the last date from a legal document.
    """
    file_location = f"temp/{file.filename}"
    Path(file_location).parent.mkdir(parents=True, exist_ok=True)
    
    try:
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        document_content = extract_text_from_pdf(file_location)
        if not document_content:
            raise HTTPException(status_code=400, detail="Could not extract text from the document.")

        last_date = extract_last_date(document_content, GOOGLE_API_KEY)
        
        return LastDateResponse(last_date=last_date)
    except Exception as e:
        logger.error(f"An error occurred during date extraction: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal error occurred during date extraction.")
    finally:
        if os.path.exists(file_location):
            os.remove(file_location)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)