import os
from dotenv import load_dotenv
from langchain.schema import Document
import uuid
import numpy as np
import google.generativeai as genai
from typing import List

from pinecone import Pinecone

load_dotenv()

# Google GenAI configuration
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
EMBEDDING_MODEL = "gemini-embedding-001"  # Google's latest embedding model
EMBEDDING_DIM = 3072  # Google's text-embedding-004 dimension

# Pinecone configuration
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY_2")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME_2", "doc-embeddings")
PINECONE_METRIC = os.getenv("PINECONE_METRIC", "cosine")
USE_PINECONE = bool(PINECONE_API_KEY)

# Initialize Pinecone client
pc = Pinecone(api_key=PINECONE_API_KEY) if USE_PINECONE else None

# Initialize Google GenAI
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables")

genai.configure(api_key=GOOGLE_API_KEY)

class GoogleGenAIEmbeddings:
    """Wrapper class for Google GenAI embeddings to match LangChain interface"""
    
    def __init__(self, model_name: str = EMBEDDING_MODEL):
        self.model_name = model_name
    
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed a list of documents"""
        embeddings = []
        
        # Process in batches to handle rate limits
        batch_size = 10  # Adjust based on API limits
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_embeddings = []
            
            for text in batch:
                try:
                    result = genai.embed_content(
                        model=f"models/{self.model_name}",
                        content=text,
                        task_type="RETRIEVAL_DOCUMENT"
                    )
                    batch_embeddings.append(result['embedding'])
                except Exception as e:
                    print(f"Error embedding text: {e}")
                    # Return zero vector as fallback
                    batch_embeddings.append([0.0] * EMBEDDING_DIM)
            
            embeddings.extend(batch_embeddings)
        
        return embeddings
    
    def embed_query(self, text: str) -> List[float]:
        """Embed a single query"""
        try:
            truncated_text = self._truncate_text(text)
            result = genai.embed_content(
                model=f"models/{self.model_name}",
                content=truncated_text,
                task_type="RETRIEVAL_QUERY"
            )
            return result['embedding']
        except Exception as e:
            print(f"Error embedding query: {e}")
            if "quota" in str(e).lower() or "rate limit" in str(e).lower():
                print("Rate limit hit on query! Waiting...")
                time.sleep(10)
                try:
                    result = genai.embed_content(
                        model=f"models/{self.model_name}",
                        content=truncated_text,
                        task_type="RETRIEVAL_QUERY",
                        output_dimensionality=EMBEDDING_DIM  # Specify 3072 dimensions
                    )
                    return result['embedding']
                except:
                    pass
            return [0.0] * EMBEDDING_DIM

# --- Caching the embedding model ---
_EMBEDDING_MODEL_INSTANCE = GoogleGenAIEmbeddings(model_name=EMBEDDING_MODEL)

def get_embedding_model():
    """Return cached embedding model instance."""
    return _EMBEDDING_MODEL_INSTANCE

# ---- Pinecone helpers ----
def init_pinecone_index(index_name: str = PINECONE_INDEX_NAME):
    if not USE_PINECONE:
        raise RuntimeError("Pinecone is not configured. Set PINECONE_API_KEY in .env")
    return pc.Index(index_name)

def _normalize_vector(vec):
    """Normalize vector (optional for cosine similarity in Pinecone)"""
    arr = np.array(vec, dtype=np.float32)
    norm = np.linalg.norm(arr)
    if norm > 0:
        arr = arr / norm
    return arr.tolist()

def upsert_chunks_to_pinecone(chunks, metadatas=None, index_name: str = PINECONE_INDEX_NAME, namespace: str = None, batch_size: int = 100):
    if not USE_PINECONE:
        raise RuntimeError("Pinecone not enabled in environment variables.")

    embedder = get_embedding_model()
    print(f"Generating embeddings for {len(chunks)} chunks using Google GenAI...")
    embeddings = embedder.embed_documents(chunks)

    idx = init_pinecone_index(index_name=index_name)

    vectors_to_upsert = []
    returned_ids = []
    for i, emb in enumerate(embeddings):
        chunk_id = str(uuid.uuid4())
        if metadatas and i < len(metadatas):
            chunk_id = str(metadatas[i].get("chunk_id", chunk_id))

        metadata = metadatas[i].copy() if metadatas and i < len(metadatas) else {}
        metadata["text"] = chunks[i]
        metadata["conversation_id"] = namespace

        # For Google embeddings, normalization might not be necessary
        # but keeping it for consistency
        vec = _normalize_vector(emb)
        vectors_to_upsert.append((chunk_id, vec, metadata))
        returned_ids.append(chunk_id)

        if len(vectors_to_upsert) >= batch_size:
            print(f"Upserting batch of {len(vectors_to_upsert)} vectors...")
            idx.upsert(vectors=vectors_to_upsert, namespace=namespace)
            vectors_to_upsert = []

    if vectors_to_upsert:
        print(f"Upserting final batch of {len(vectors_to_upsert)} vectors...")
        idx.upsert(vectors=vectors_to_upsert, namespace=namespace)

    print(f"Successfully upserted {len(chunks)} vectors to Pinecone")
    return returned_ids

def query_pinecone(query: str, top_k: int = 4, index_name: str = PINECONE_INDEX_NAME, namespace: str = None):
    if not USE_PINECONE:
        raise RuntimeError("Pinecone not enabled in environment variables.")

    embedder = get_embedding_model()
    print(f"Generating query embedding using Google GenAI...")
    qvec = embedder.embed_query(query)
    qvec = _normalize_vector(qvec)

    idx = init_pinecone_index(index_name=index_name)
    res = idx.query(vector=qvec, top_k=top_k, include_metadata=True, namespace=namespace)
    matches = res.matches

    docs = []
    for m in matches:
        metadata = m.metadata or {}
        text = metadata.get("text", "")
        docs.append(Document(page_content=text, metadata=metadata))
    
    print(f"Retrieved {len(docs)} relevant documents")
    return docs

def delete_namespace_from_pinecone(index_name: str = PINECONE_INDEX_NAME, namespace: str = None):
    if not USE_PINECONE:
        raise RuntimeError("Pinecone not enabled.")
    idx = init_pinecone_index(index_name=index_name)
    if namespace:
        idx.delete(delete_all=True, namespace=namespace)