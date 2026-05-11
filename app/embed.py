from pathlib import Path
import chromadb
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

CHROMA_PATH = str(Path("embeddings").resolve())
chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_or_create_collection(name: str = "financial_docs"):
    return chroma_client.get_or_create_collection(name=name)

def get_embeddings(texts: list[str]) -> list[list[float]]:
    response = client.embeddings.create(
        model="nomic-embed-text-v1_5",
        input=texts
    )
    return [item.embedding for item in response.data]

def embed_and_store(chunks: list[str], doc_name: str) -> int:
    try:
        chroma_client.delete_collection("financial_docs")
    except:
        pass

    collection = get_or_create_collection()

    # Process in batches of 50
    batch_size = 50
    all_embeddings = []
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i+batch_size]
        embeddings = get_embeddings(batch)
        all_embeddings.extend(embeddings)

    collection.add(
        documents=chunks,
        embeddings=all_embeddings,
        ids=[f"{doc_name}_chunk_{i}" for i in range(len(chunks))],
        metadatas=[{"source": doc_name, "chunk_index": i} for i in range(len(chunks))]
    )

    return len(chunks)

def query_similar_chunks(question: str, n_results: int = 5) -> list[str]:
    collection = get_or_create_collection()
    question_embedding = get_embeddings([question])[0]

    results = collection.query(
        query_embeddings=[question_embedding],
        n_results=n_results
    )

    return results["documents"][0]
