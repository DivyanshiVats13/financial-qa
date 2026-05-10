import shutil
from pathlib import Path
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.ingest import load_and_chunk_pdf
from app.embed import embed_and_store, query_similar_chunks
from app.qa import generate_answer

app = FastAPI(title="Financial QA API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Financial QA API is running"}

@app.post("/ingest")
async def ingest(file: UploadFile = File(...)):
    save_path = Path("data") / file.filename
    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    result = load_and_chunk_pdf(str(save_path))
    embed_and_store(result["chunks"], file.filename)

    return {
        "status": "ok",
        "filename": file.filename,
        "pages": result["num_pages"],
        "chunks": result["num_chunks"],
        "time_sec": result["time_sec"]
    }

@app.post("/search")
async def search(payload: dict):
    question = payload.get("question", "")
    chunks = query_similar_chunks(question)
    return {"question": question, "results": chunks}

@app.post("/ask")
async def ask(payload: dict):
    question = payload.get("question", "")
    chunks = query_similar_chunks(question, n_results=5)
    answer = generate_answer(question, chunks)
    return {
        "question": question,
        "answer": answer,
        "sources": chunks
    }