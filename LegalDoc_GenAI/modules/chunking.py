from pathlib import Path
from typing import List
import docx
import os
from pypdf import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter

SUPPORTED = (".pdf", ".txt", ".docx")

def load_txt(path: Path) -> str:
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()

def load_docx(path: Path) -> str:
    doc = docx.Document(path)
    full = []
    for para in doc.paragraphs:
        full.append(para.text)
    return "\n".join(full)

def load_pdf(path: Path) -> str:
    reader = PdfReader(str(path))
    full = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            full.append(text)
    return "\n".join(full)

def load_file_to_text(filepath: str) -> str:
    path = Path(filepath)
    ext = path.suffix.lower()
    if ext not in SUPPORTED:
        raise ValueError(f"Unsupported file type: {ext}")
    if ext == ".txt":
        return load_txt(path)
    if ext == ".docx":
        return load_docx(path)
    if ext == ".pdf":
        return load_pdf(path)

def chunk_text(text: str, chunk_size: int = 800, chunk_overlap: int = 150) -> List[str]:
    """
    Optimized chunking for Google GenAI embeddings:
    - Reduced chunk_size to 800 (from 1000) to stay well within token limits
    - Reduced overlap to 150 to minimize redundancy
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size, 
        chunk_overlap=chunk_overlap,
        # Add separators optimized for better semantic chunking
        separators=["\n\n", "\n", ". ", "! ", "? ", ", ", " ", ""]
    )
    chunks = splitter.split_text(text)
    
    # Filter out very small chunks that might not be meaningful
    chunks = [chunk for chunk in chunks if len(chunk.strip()) > 50]
    
    return chunks

def file_to_chunks(filepath: str, chunk_size: int = 800, chunk_overlap: int = 150):
    """
    Convert file to chunks optimized for Google GenAI embeddings
    """
    text = load_file_to_text(filepath)
    chunks = chunk_text(text, chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    
    print(f"Generated {len(chunks)} chunks with average length: {sum(len(c) for c in chunks) // len(chunks) if chunks else 0}")
    
    # Log any chunks that might be problematic
    long_chunks = [i for i, chunk in enumerate(chunks) if len(chunk) > 1500]
    if long_chunks:
        print(f"Warning: {len(long_chunks)} chunks are longer than 1500 characters and may exceed token limits")
    
    return chunks