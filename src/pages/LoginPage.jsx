import SignInArt from "../assets/SIGNIN.png";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");

    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        navigate("/");
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-modal login--split" role="dialog">
        <div className="login-visual">
          <img src={SignInArt} alt="Travista sign-in illustration" />
        </div>

        <div className="login-content">
          <h2>Welcome to Travista</h2>

          <label style={{ fontSize: 12, color: "#777" }}>Email</label>
          <input
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label style={{ fontSize: 12, color: "#777" }}>Password</label>
          <div className="input-with-toggle">
            <input
              className="has-toggle"
              placeholder="********"
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="toggle-visibility"
              onClick={() => setShowPwd(v => !v)}
            >
              {showPwd ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>

          <button className="login-primary" onClick={handleLogin}>
            Login
          </button>

          {/* 🔴 Centered error text */}
          {error && (
            <p
              style={{
                color: "red",
                textAlign: "center",
                marginTop: "8px",
                fontSize: "13px",
              }}
            >
              {error}
            </p>
          )}

          <div className="login-or"><span>or</span></div>
          <button className="login-google">Sign in with Google</button>

          <p className="login-footer">
            New to Travista? <Link to="/signup">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
