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
      const response = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Invalid email or password");
        return;
      }

      localStorage.setItem("access_token", data.access_token);

      navigate("/planner");
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <div
        className="login-modal login--split"
        role="dialog"
        aria-modal="true"
        aria-labelledby="loginTitle"
      >
        <div className="login-visual" aria-hidden="true">
          <img src={SignInArt} alt="Travista sign-in illustration" />
        </div>

        <div className="login-content">
          <h2 id="loginTitle">Welcome to Travista</h2>

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
              aria-label={showPwd ? "Hide password" : "Show password"}
              onClick={() => setShowPwd((v) => !v)}
            >
              {showPwd ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>

          <p
            style={{
              textAlign: "right",
              marginTop: "6px",
              fontSize: "14px",
              textDecoration: "underline",
              color: "#4caf50",
              cursor: "pointer",
            }}
          >
            Forgot password?
          </p>

          <button className="login-primary" onClick={handleLogin}>
            Login
          </button>

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

          <div className="login-or">
            <span>or</span>
          </div>

          <button className="login-google">Sign in with Google</button>

          <p className="login-footer">
            New to Travista? <Link to="/signup">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
