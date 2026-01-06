import SignInArt from "../assets/SIGNIN.png";
import { useState } from "react";
import { Link } from "react-router-dom";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

export default function LoginPage() {
  const [showPwd, setShowPwd] = useState(false);
  return (
    <div className="login-page">
      <div className="login-modal login--split" role="dialog" aria-modal="true" aria-labelledby="loginTitle">
        <div className="login-visual" aria-hidden="true">
          <img src={SignInArt} alt="Travista sign-in illustration" />
        </div>
        <div className="login-content">
          <h2 id="loginTitle">Welcome to Travista</h2>
          <label style={{fontSize:12,color:'#777'}}>Email</label>
          <input placeholder="you@example.com" />
          <label style={{fontSize:12,color:'#777'}}>Password</label>
          <div className="input-with-toggle">
            <input className="has-toggle" placeholder="********" type={showPwd ? "text" : "password"} />
            <button
              type="button"
              className="toggle-visibility"
              aria-label={showPwd ? "Hide password" : "Show password"}
              onClick={() => setShowPwd(v => !v)}
            >
              {showPwd ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>
          <div className="login-actions">
            <a className="forgot" href="#">Forgot password?</a>
          </div>
          <button className="login-primary">Login</button>
          <div className="login-or"><span>or</span></div>
          <button className="login-google">Sign in with Google</button>
          <p className="login-footer">New to Travista? <Link to="/signup">Create Account</Link></p>
        </div>
      </div>
    </div>
  );
}
