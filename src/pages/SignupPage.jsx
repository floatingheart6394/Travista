import SignUpArt from "../assets/SIGNUP.png";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

export default function SignupPage() {
  const [showPwd1, setShowPwd1] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignup = async () => {
    setError("");

    if (!name || !email || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError("Password and confirm password do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        navigate("/login");
      } else {
        setError("User already exists");
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
          <img src={SignUpArt} alt="Travista sign-up illustration" />
        </div>

        <div className="login-content">
          <h2>Create your Travista account</h2>

          <label style={{ fontSize: 12, color: "#777" }}>Full name</label>
          <input
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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
              placeholder="Create a password"
              type={showPwd1 ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="toggle-visibility" onClick={() => setShowPwd1(v => !v)}>
              {showPwd1 ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>

          <label style={{ fontSize: 12, color: "#777" }}>
            Confirm password
          </label>
          <div className="input-with-toggle">
            <input
              className="has-toggle"
              placeholder="Re-enter your password"
              type={showPwd2 ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button type="button" className="toggle-visibility" onClick={() => setShowPwd2(v => !v)}>
              {showPwd2 ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>

          <button className="login-primary" onClick={handleSignup}>
            Create Account
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

          <div className="login-or"><span>or</span></div>
          <button className="login-google">Continue with Google</button>

          <p className="login-footer">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
