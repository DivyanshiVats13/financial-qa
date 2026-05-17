# 💹 Financial Q&A — AI-Powered PDF Document Assistant

> Ask questions about your financial documents using AI. Upload any financial PDF (reports, statements, prospectuses) and get instant, context-aware answers powered by Groq LLM and RAG.

---

## ✨ Features

- 📄 **Upload financial PDFs** — annual reports, balance sheets, prospectuses, statements
- 🔍 **RAG-powered Q&A** — retrieves the most relevant document sections before answering
- ⚡ **Groq LLM** — ultra-fast inference for real-time responses
- 🗃️ **ChromaDB vector store** — semantic search over your documents
- 🌐 **Simple web UI** — clean frontend, no account needed

---

## 🏗️ Architecture

```
financial-qa/
├── app/                   # FastAPI backend
│   └── main.py            # API routes: /upload, /ask
├── frontend/              # Static HTML/CSS/JS UI
├── requirements.txt       # Python dependencies
├── render.yml             # Render deployment config
└── package.json           # JS dependencies (axios)
```

**Flow:**
```
User uploads PDF
    → PDF text extracted (pypdf)
    → Text chunked (LangChain text splitters)
    → Chunks embedded & stored (ChromaDB)
    → User asks a question
    → Relevant chunks retrieved
    → Groq LLM generates answer
    → Response shown in UI
```

---

## 🚀 Quick Start (Local)

### Prerequisites
- Python 3.10+
- A [Groq API key](https://console.groq.com) (free)

### 1. Clone the repo
```bash
git clone https://github.com/DivyanshiVats13/financial-qa.git
cd financial-qa
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Set environment variables
```bash
# Create a .env file
echo "GROQ_API_KEY=your_groq_api_key_here" > .env
```

### 4. Run the backend
```bash
uvicorn app.main:app --reload
```

### 5. Open the frontend
Open `frontend/index.html` in your browser, or serve it:
```bash
# Optional: serve frontend with Python
python -m http.server 3000 --directory frontend
```

The API will be available at `http://localhost:8000` and docs at `http://localhost:8000/docs`.

---

## ☁️ Deployment (Render — Free)

This project includes a `render.yml` for one-click deployment to [Render](https://render.com).

### Backend Deployment

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New** → **Blueprint**
3. Connect your `financial-qa` repository
4. Render auto-detects `render.yml` and configures the service
5. Add your environment variable:
   - Key: `GROQ_API_KEY`
   - Value: your Groq API key
6. Click **Deploy**

Your backend will be live at:
```
https://financial-qa-backend.onrender.com
```

### Frontend Deployment (Static Site)

1. On Render → **New** → **Static Site**
2. Connect the same repo
3. Set **Publish directory** to `frontend`
4. Click **Deploy**

Your frontend URL will look like:
```
https://financial-qa-frontend.onrender.com
```

> **Note on Free Tier:** Render's free tier spins down after 15 minutes of inactivity. To keep it 24/7, either upgrade to the Starter plan (~$7/mo) or use [UptimeRobot](https://uptimerobot.com) to ping your service every 10 minutes for free.

---

## 🔌 API Reference

### `POST /upload`
Upload a PDF document for processing.

**Request:** `multipart/form-data`
| Field | Type | Description |
|-------|------|-------------|
| `file` | File | PDF file to upload |

**Response:**
```json
{
  "message": "PDF processed successfully",
  "chunks": 42
}
```

### `POST /ask`
Ask a question about the uploaded document.

**Request:** `application/json`
```json
{
  "question": "What was the net revenue in Q3?"
}
```

**Response:**
```json
{
  "answer": "The net revenue in Q3 was $2.4 billion, up 12% year-over-year..."
}
```

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI + Uvicorn |
| PDF Parsing | pypdf |
| Text Chunking | LangChain Text Splitters |
| Vector Store | ChromaDB |
| LLM | Groq (LLaMA 3 / Mixtral) |
| Frontend | Vanilla HTML/CSS/JS + Axios |
| Deployment | Render |

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | ✅ Yes | Your Groq API key from [console.groq.com](https://console.groq.com) |

---

## 📋 Known Limitations

- **ChromaDB is in-memory by default** — uploaded documents are cleared when the server restarts. For persistence, configure a persistent ChromaDB directory.
- **One document at a time** — the current implementation works best with a single PDF session. Multi-document support can be added with per-session collections.
- **Free tier cold starts** — Render free tier has a ~30s spin-up delay after inactivity.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👩‍💻 Author

**Divyanshi Vats** — [@DivyanshiVats13](https://github.com/DivyanshiVats13)
