import torch
from sentence_transformers import SentenceTransformer
from pathlib import Path
import chromadb

# Load model once when the module is imported
MODEL_NAME = "all-MiniLM-L6-v2"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

print(f"Loading embedding model on {DEVICE}...")
model = SentenceTransformer(MODEL_NAME, device=DEVICE)
print("Embedding model loaded.")

# ChromaDB client
CHROMA_PATH = str(Path("embeddings").resolve())
chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)

def get_or_create_collection(name: str = "financial_docs"):
    return chroma_client.get_or_create_collection(
        name=name,
        metadata={"hnsw:space": "cosine"}
    )

def embed_and_store(chunks: list[str], doc_name: str) -> int:
    # Delete existing collection for this doc and recreate
    try:
        chroma_client.delete_collection("financial_docs")
    except:
        pass

    collection = get_or_create_collection()

    # Generate embeddings using PyTorch on GPU
    print(f"Generating embeddings for {len(chunks)} chunks on {DEVICE}...")
    embeddings = model.encode(
        chunks,
        batch_size=32,
        show_progress_bar=True,
        convert_to_numpy=True,
        device=DEVICE
    )

    # Store in ChromaDB
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

    # Embed the question
    question_embedding = model.encode(
        [question],
        convert_to_numpy=True,
        device=DEVICE
    )

    # Search ChromaDB
    results = collection.query(
        query_embeddings=question_embedding.tolist(),
        n_results=n_results
    )

    return results["documents"][0]