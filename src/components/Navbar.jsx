import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <h2
        data-cursor-big="true"
        onClick={() => navigate("/")}
        style={{ userSelect: "none" }}
      >
        TRAVISTA
      </h2>
      <div className="nav-links">
        <a href="#plan" data-cursor-big="true">
          Plan
        </a>
        <a href="#budget" data-cursor-big="true">
          Budget
        </a>
        <a data-cursor-big="true">Play</a>
        <a data-cursor-big="true">Community</a>
        <a data-cursor-big="true" onClick={() => navigate("/ai")}>
          AI Assistant
        </a>
        <button className="login-btn" onClick={() => navigate("/login")}>
          Login / Sign up
        </button>
      </div>
    </nav>
  );
}
