import SignUpArt from "../assets/SIGNUP.png";
import { Link } from "react-router-dom";
import { useState } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

export default function SignupPage() {
  const [showPwd1, setShowPwd1] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  return (
    <div className="login-page">
      <div className="login-modal login--split" role="dialog" aria-modal="true" aria-labelledby="signupTitle">
        <div className="login-visual" aria-hidden="true">
          <img src={SignUpArt} alt="Travista sign-up illustration" />
        </div>
        <div className="login-content">
          <h2 id="signupTitle">Create your Travista account</h2>

          <label style={{fontSize:12,color:'#777'}}>Full name</label>
          <input placeholder="Jane Doe" />

          <label style={{fontSize:12,color:'#777'}}>Email</label>
          <input placeholder="you@example.com" type="email" />

          <label style={{fontSize:12,color:'#777'}}>Password</label>
          <div className="input-with-toggle">
            <input className="has-toggle" placeholder="Create a password" type={showPwd1 ? "text" : "password"} />
            <button
              type="button"
              className="toggle-visibility"
              aria-label={showPwd1 ? "Hide password" : "Show password"}
              onClick={() => setShowPwd1(v => !v)}
            >
              {showPwd1 ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>

          <label style={{fontSize:12,color:'#777'}}>Confirm password</label>
          <div className="input-with-toggle">
            <input className="has-toggle" placeholder="Re-enter your password" type={showPwd2 ? "text" : "password"} />
            <button
              type="button"
              className="toggle-visibility"
              aria-label={showPwd2 ? "Hide password" : "Show password"}
              onClick={() => setShowPwd2(v => !v)}
            >
              {showPwd2 ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>

          <button className="login-primary">Create Account</button>
          <div className="login-or"><span>or</span></div>
          <button className="login-google">Continue with Google</button>

          <p className="login-footer">Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
}
