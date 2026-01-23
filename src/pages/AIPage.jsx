import { useEffect, useState, useRef } from "react";
import NewNavbar from "../components/NewNavbar";
import {
  FiMic,
  FiSend,
  FiMapPin,
  FiDollarSign,
  FiCoffee,
  FiCalendar,
  FiUpload,
  FiImage,
} from "react-icons/fi";
import { useLocation } from "react-router-dom";
import { FaRegStar } from "react-icons/fa";
import { chatWithRAG, ocrExtractText, ocrChatWithRAG } from "../services/ragService";

export default function AIPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "ai",
      author: "Tavi AI",
      text: "Hi! I'm Tavi, your AI travel assistant! 🌍 How can I help you plan your perfect trip today? You can also upload travel documents for OCR analysis!",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrPreview, setOcrPreview] = useState(null);
  const fileInputRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q");
    if (q) setInput(q);
  }, [location.search]);

  const sendMessage = async () => {
  const trimmed = input.trim();
  if (!trimmed) return;

  const userMsg = {
    id: Date.now(),
    role: "user",
    author: "You",
    text: trimmed,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  // 1️⃣ Add user message immediately
  setMessages((prev) => [...prev, userMsg]);
  setInput("");
  setIsProcessing(true);

  try {
    // 2️⃣ Call backend
      const ragResult = await chatWithRAG(trimmed);

      // Add AI reply with sources
      const aiMsg = {
        id: Date.now() + 1,
        role: "ai",
        author: "Tavi AI",
        text: ragResult.answer,
        context: ragResult.context,
        source: ragResult.source,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

    setMessages((prev) => [...prev, aiMsg]);
  } catch (error) {
    console.error("Error:", error);
    // 4️⃣ Error handling
    const errorMessage = error.message || "Something went wrong. Please try again.";
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 2,
        role: "ai",
        author: "Tavi AI",
        text: `⚠️ ${errorMessage}`,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  } finally {
    setIsProcessing(false);
  }
};

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    try {
      // Step 1: Extract text from image
      const ocrResult = await ocrExtractText(file);
      
      if (ocrResult.status !== "success") {
        throw new Error(ocrResult.error || "OCR failed");
      }

      // Show OCR preview
      const preview = {
        fileName: file.name,
        text: ocrResult.text,
        confidence: ocrResult.confidence,
        confidenceLevel: ocrResult.confidenceLevel,
      };
      setOcrPreview(preview);

      // Add user message showing uploaded file
      const userMsg = {
        id: Date.now(),
        role: "user",
        author: "You",
        text: `📄 Uploaded: ${file.name} (OCR Confidence: ${ocrResult.confidence.toFixed(1)}%)`,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, userMsg]);

      // Step 2: Process extracted text through RAG
      const ragResult = await ocrChatWithRAG(ocrResult.text);

      if (ragResult.status === "success") {
        const aiMsg = {
          id: Date.now() + 1,
          role: "ai",
          author: "Tavi AI",
          text: ragResult.answer,
          context: ragResult.context,
          source: "OCR+RAG",
          extractedText: ocrResult.text,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (error) {
      console.error("OCR error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "ai",
          author: "Tavi AI",
          text: `⚠️ OCR processing failed: ${error.message}. Make sure Tesseract-OCR is installed.`,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const quickAsk = (q) => {
    setInput(q);
  };

  const popularTopics = [
    { title: "Destinations", sub: "Get recommendations", icon: <FiMapPin /> },
    { title: "Budget Tips", sub: "Save money", icon: <FiDollarSign /> },
    { title: "Food & Dining", sub: "Local cuisine", icon: <FiCoffee /> },
    { title: "Trip Planning", sub: "Custom itineraries", icon: <FiCalendar /> },
  ];

  const quickQuestions = [
    "Best cafes in Paris?",
    "Budget tips for Tokyo",
    "Hidden gems in Rome",
    "Vegan restaurants nearby",
  ];

  return (
    <div className="dashboard-page">
      <NewNavbar />
      <main className="dashboard-content">
        <div className="ai-layout">
          <section className="ai-chat">
            <div className="ai-thread">
              {messages.map((m) => (
                <article
                  key={m.id}
                  className={`msg ${m.role === "ai" ? "msg-ai" : "msg-user"}`}
                >
                  {m.role === "ai" && (
                    <header className="msg-head">
                      <span className="dot">
                        <FaRegStar />
                      </span>
                      <strong>Tavi AI</strong>
                    </header>
                  )}
                  <div className="msg-bubble">
                    <p>{m.text}</p>
                    {m.extractedText && (
                      <details style={{ marginTop: "8px", fontSize: "0.9em" }}>
                        <summary>📄 Extracted Text</summary>
                        <pre style={{
                          backgroundColor: "#f5f5f5",
                          padding: "8px",
                          borderRadius: "4px",
                          maxHeight: "200px",
                          overflow: "auto",
                          marginTop: "8px",
                          fontSize: "0.85em"
                        }}>
                          {m.extractedText}
                        </pre>
                      </details>
                    )}
                  </div>
                  <footer className="msg-time">{m.time}</footer>
                </article>
              ))}
            </div>

            {ocrPreview && (
              <div style={{
                backgroundColor: "#f9f9f9",
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "12px",
                margin: "12px 0",
                fontSize: "0.9em"
              }}>
                <strong>📸 OCR Preview</strong>
                <p><strong>File:</strong> {ocrPreview.fileName}</p>
                <p><strong>Confidence:</strong> {ocrPreview.confidence.toFixed(1)}% ({ocrPreview.confidenceLevel})</p>
                <p><strong>Characters:</strong> {ocrPreview.text.length} | <strong>Words:</strong> {ocrPreview.text.split(/\s+/).length}</p>
                <details>
                  <summary>View Extracted Text</summary>
                  <pre style={{
                    backgroundColor: "#fff",
                    padding: "8px",
                    borderRadius: "4px",
                    maxHeight: "300px",
                    overflow: "auto",
                    marginTop: "8px",
                    fontSize: "0.85em"
                  }}>
                    {ocrPreview.text}
                  </pre>
                </details>
                <button 
                  onClick={() => setOcrPreview(null)}
                  style={{ marginTop: "8px", padding: "4px 8px", fontSize: "0.9em" }}
                >
                  Clear Preview
                </button>
              </div>
            )}

            <div className="ai-input">
              <button 
                className="icon left" 
                aria-label="Upload Image"
                onClick={() => fileInputRef.current?.click()}
                title="Upload travel document for OCR analysis"
              >
                <FiUpload />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isProcessing && sendMessage()}
                placeholder="Ask about travel or upload a document..."
                disabled={isProcessing}
              />
              <button 
                className="send" 
                onClick={sendMessage} 
                aria-label="Send"
                disabled={isProcessing}
              >
                {isProcessing ? "..." : <FiSend />}
              </button>
            </div>
          </section>

          <aside className="ai-sidebar">
            <div className="panel">
              <h3>Popular Topics</h3>
              <div className="topic-list">
                {popularTopics.map((t) => (
                  <button
                    key={t.title}
                    className="topic-card"
                    onClick={() => quickAsk(t.title)}
                  >
                    <div className="topic-icon">{t.icon}</div>
                    <div className="topic-copy">
                      <strong>{t.title}</strong>
                      <span>{t.sub}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="panel">
              <h3>Quick Questions</h3>
              <div className="quick-list">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    className="quick-item"
                    onClick={() => quickAsk(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
