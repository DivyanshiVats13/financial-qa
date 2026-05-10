import torch
from sentence_transformers import SentenceTransformer
from pathlib import Path
import chromadb

MODEL_NAME = "all-MiniLM-L6-v2"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Lazy loading — model loads only when first needed
_model = None

def get_model():
    global _model
    if _model is None:
        print(f"Loading embedding model on {DEVICE}...")
        _model = SentenceTransformer(MODEL_NAME, device=DEVICE)
        print("Embedding model loaded.")
    return _model

CHROMA_PATH = str(Path("embeddings").resolve())
chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)

def get_or_create_collection(name: str = "financial_docs"):
    return chroma_client.get_or_create_collection(
        name=name,
        metadata={"hnsw:space": "cosine"}
    )

def embed_and_store(chunks: list[str], doc_name: str) -> int:
    try:
        chroma_client.delete_collection("financial_docs")
    except:
        pass

    collection = get_or_create_collection()
    model = get_model()

    print(f"Generating embeddings for {len(chunks)} chunks on {DEVICE}...")
    embeddings = model.encode(
        chunks,
        batch_size=32,
        show_progress_bar=True,
        convert_to_numpy=True,
        device=DEVICE
    )

    collection.add(
        documents=chunks,
        embeddings=embeddings.tolist(),
        ids=[f"{doc_name}_chunk_{i}" for i in range(len(chunks))],
        metadatas=[{"source": doc_name, "chunk_index": i} for i in range(len(chunks))]
    )

    print(f"Stored {len(chunks)} chunks in ChromaDB.")
    return len(chunks)

def query_similar_chunks(question: str, n_results: int = 5) -> list[str]:
    collection = get_or_create_collection()
    model = get_model()

    question_embedding = model.encode(
        [question],
        convert_to_numpy=True,
        device=DEVICE
    )

    results = collection.query(
        query_embeddings=question_embedding.tolist(),
        n_results=n_results
    )

    return results["documents"][0]