import time
from pathlib import Path
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter


def load_and_chunk_pdf(file_path: str) -> dict:
    start = time.time()

    # Step 1 — Read PDF
    reader = PdfReader(file_path)
    pages = []
    for page in reader.pages:
        text = page.extract_text()
        if text and text.strip():
            pages.append(text.strip())

    full_text = "\n\n".join(pages)

    # Step 2 — Split into chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        separators=["\n\n", "\n", ".", " "]
    )
    chunks = splitter.split_text(full_text)

    elapsed = round(time.time() - start, 2)

    return {
        "chunks": chunks,
        "num_chunks": len(chunks),
        "num_pages": len(reader.pages),
        "time_sec": elapsed
    }