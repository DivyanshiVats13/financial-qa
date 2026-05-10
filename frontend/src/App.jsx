import { useState } from "react";
import axios from "axios";

const API = "http://localhost:8000";

export default function App() {
  const [file, setFile] = useState(null);
  const [indexed, setIndexed] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  const handleIngest = async () => {
    if (!file) return;
    setIndexing(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await axios.post(`${API}/ingest`, form);
      setStats(res.data);
      setIndexed(true);
    } catch {
      alert("Ingestion failed. Is the backend running?");
    }
    setIndexing(false);
  };

  const handleAsk = async () => {
    if (!question.trim() || !indexed) return;
    const q = question.trim();
    setQuestion("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setLoading(true);
    try {
      const res = await axios.post(`${API}/ask`, { question: q });
      setMessages((m) => [
        ...m,
        { role: "ai", content: res.data.answer, sources: res.data.sources },
      ]);
    } catch {
      setMessages((m) => [...m, { role: "ai", content: "Error getting answer." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Segoe UI', sans-serif", background: "#f9fafb", color: "#111" }}>

      {/* Sidebar */}
      <div style={{ width: 300, background: "#fff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column", padding: 28, gap: 20 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8 }}>
            <span style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>F</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#111" }}>FinLens</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>Financial Report Q&A</div>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid #e5e7eb" }} />

        {/* Upload */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Upload PDF</div>
          <label style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            border: "2px dashed #d1fae5", borderRadius: 10, padding: "20px 12px", cursor: "pointer",
            background: file ? "#f0fdf4" : "#fafafa", gap: 6, transition: "all 0.2s"
          }}>
            <span style={{ fontSize: 28 }}>📄</span>
            <span style={{ fontSize: 12, color: "#6b7280", textAlign: "center" }}>
              {file ? file.name : "Click to choose a PDF"}
            </span>
            <input type="file" accept=".pdf" style={{ display: "none" }}
              onChange={(e) => { setFile(e.target.files[0]); setIndexed(false); setStats(null); setMessages([]); }} />
          </label>
        </div>

        {/* Process Button */}
        <button onClick={handleIngest} disabled={!file || indexing || indexed}
          style={{
            padding: "12px", borderRadius: 8, border: "none", fontWeight: 600, fontSize: 14, cursor: file && !indexed ? "pointer" : "not-allowed",
            background: indexed ? "#dcfce7" : file ? "#16a34a" : "#e5e7eb",
            color: indexed ? "#16a34a" : file ? "#fff" : "#9ca3af",
            transition: "all 0.2s"
          }}>
          {indexing ? "⏳ Processing..." : indexed ? "✅ Document Indexed" : "Process Document"}
        </button>

        {/* Stats */}
        {stats && (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[["Pages", stats.pages], ["Chunks", stats.chunks], ["Time", `${stats.time_sec}s`], ["Model", "BGE"]].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#16a34a" }}>{val}</div>
              </div>
            ))}
          </div>
        )}

        {/* Stack info */}
        <div style={{ marginTop: "auto", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Tech Stack</div>
          {["FastAPI", "ChromaDB", "PyTorch", "Llama-3.3-70b", "React + Vite"].map(t =>  (
            <div key={t} style={{ fontSize: 11, color: "#6b7280", padding: "2px 0" }}>· {t}</div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {/* Top bar */}
        <div style={{ padding: "16px 32px", background: "#fff", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: "#111" }}>
            {indexed ? `📂 ${file?.name}` : "No document loaded"}
          </div>
          <div style={{ fontSize: 12, color: indexed ? "#16a34a" : "#9ca3af", fontWeight: 600 }}>
            {indexed ? "● Ready" : "○ Waiting"}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px", display: "flex", flexDirection: "column", gap: 24 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: "center", marginTop: 60, color: "#9ca3af" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>
                {indexed ? "Ask anything about your document." : "Upload and process a PDF to begin."}
              </div>
              {indexed && (
                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                  {["What is this document about?", "What are the key topics covered?", "Summarize the main points."].map(q => (
                    <button key={q} onClick={() => { setQuestion(q); }}
                      style={{ padding: "8px 16px", border: "1px solid #d1fae5", borderRadius: 20, background: "#f0fdf4", color: "#16a34a", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", gap: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: msg.role === "user" ? "#6b7280" : "#16a34a" }}>
                {msg.role === "user" ? "You" : "FinLens"}
              </div>
              <div style={{
                padding: "12px 18px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: msg.role === "user" ? "#16a34a" : "#fff",
                color: msg.role === "user" ? "#fff" : "#111",
                border: msg.role === "user" ? "none" : "1px solid #e5e7eb",
                maxWidth: "70%", fontSize: 14, lineHeight: 1.7,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
              }}>
                {msg.content}
              </div>
              {msg.sources && (
                <div style={{ maxWidth: "70%", display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                  <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>Sources used</div>
                  {msg.sources.slice(0, 2).map((s, j) => (
                    <div key={j} style={{ fontSize: 12, color: "#6b7280", background: "#f9fafb", border: "1px solid #e5e7eb", padding: "8px 12px", borderRadius: 6, borderLeft: "3px solid #16a34a" }}>
                      {s.slice(0, 180)}...
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#16a34a", fontSize: 13 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a", animation: "pulse 1s infinite" }} />
              FinLens is thinking...
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ padding: "16px 32px", background: "#fff", borderTop: "1px solid #e5e7eb", display: "flex", gap: 12 }}>
          <input value={question} onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk()}
            placeholder={indexed ? "Ask about revenue, risks, margins..." : "Process a document first..."}
            disabled={!indexed || loading}
            style={{
              flex: 1, padding: "12px 18px", borderRadius: 10, border: "1px solid #e5e7eb",
              fontSize: 14, outline: "none", background: "#f9fafb", color: "#111",
              fontFamily: "inherit"
            }} />
          <button onClick={handleAsk} disabled={!question.trim() || !indexed || loading}
            style={{
              padding: "12px 24px", borderRadius: 10, border: "none", fontWeight: 600, fontSize: 14,
              background: question.trim() && indexed ? "#16a34a" : "#e5e7eb",
              color: question.trim() && indexed ? "#fff" : "#9ca3af",
              cursor: question.trim() && indexed ? "pointer" : "not-allowed",
              transition: "all 0.2s"
            }}>
            Send →
          </button>
        </div>
      </div>
    </div>
  );
}
