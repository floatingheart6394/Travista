import { useEffect, useState } from "react";
import NewNavbar from "../components/NewNavbar";
import {
  FiMic,
  FiSend,
  FiMapPin,
  FiDollarSign,
  FiCoffee,
  FiCalendar,
} from "react-icons/fi";
import { useLocation } from "react-router-dom";
import { FaRegStar } from "react-icons/fa";

export default function AIPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "ai",
      author: "Tavi AI",
      text: "Hi! I'm Tavi, your AI travel assistant! 🌍 How can I help you plan your perfect trip today?",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
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

  try {
    // 2️⃣ Call backend
    const res = await fetch("http://127.0.0.1:8000/ai/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: trimmed }),
    });

    const data = await res.json();

    // 3️⃣ Add AI reply
    const aiMsg = {
      id: Date.now() + 1,
      role: "ai",
      author: "Tavi AI",
      text: data.reply,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, aiMsg]);
  } catch (error) {
    // 4️⃣ Error handling
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 2,
        role: "ai",
        author: "Tavi AI",
        text: "⚠️ Sorry, I couldn’t connect to the server.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
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
                  </div>
                  <footer className="msg-time">{m.time}</footer>
                </article>
              ))}
            </div>

            <div className="ai-input">
              <button className="icon left" aria-label="Voice">
                <FiMic />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Vegan restaurants nearby"
              />
              <button className="send" onClick={sendMessage} aria-label="Send">
                <FiSend />
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
