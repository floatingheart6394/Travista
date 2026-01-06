import { useNavigate } from "react-router-dom";
import SignInArt from "../assets/SIGNIN.png";

export default function Login() {
  const navigate = useNavigate();
  const close = () => navigate("/");

  const onOverlayClick = (e) => {
    if (e.target.classList.contains("login-modal-overlay")) close();
  };

  return (
    <div className="login-modal-overlay" onClick={onOverlayClick}>
      <div className="login-modal login--split" role="dialog" aria-modal="true" aria-labelledby="loginTitle">
        <div className="login-visual" aria-hidden="true">
          <img src={SignInArt} alt="Travista sign-in illustration" />
        </div>
        <div className="login-content">
          <button className="login-close" aria-label="Close" onClick={close}>×</button>
          <h2 id="loginTitle">Welcome to Travista</h2>
          <label style={{fontSize:12,color:'#777'}}>Email</label>
          <input placeholder="you@example.com" />
          <label style={{fontSize:12,color:'#777'}}>Password</label>
          <input placeholder="********" type="password" />
          <div className="login-actions">
            <a className="forgot" href="#">Forgot password?</a>
          </div>
          <button className="login-primary">Sign in</button>
          <div className="login-or"><span>or</span></div>
          <button className="login-google">Sign in with Google</button>
          <p className="login-footer">New to Travista? <a href="#">Create Account</a></p>
        </div>
      </div>
    </div>
  );
}
