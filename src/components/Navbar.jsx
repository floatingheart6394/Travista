import { Link, useNavigate } from "react-router-dom";
import yLogo from "../assets/y.png";

export default function Navbar() {
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <button
        type="button"
        className="navbar-brand"
        data-cursor-big="true"
        onClick={() => navigate("/")}
        aria-label="Travista home"
      >
        <img className="navbar-logo" src={yLogo} alt="" aria-hidden="true" />
        <span>TRAVISTA</span>
      </button>
      <div className="nav-links">
        <Link to="/planner" data-cursor-big="true">
          Trip Planner
        </Link>
        <Link to="/budget" data-cursor-big="true">
          Budget
        </Link>
        <Link to="/todo" data-cursor-big="true">
          To-Do
        </Link>
        <Link to="/game" data-cursor-big="true">
          Game
        </Link>
        <Link to="/emergency" data-cursor-big="true">
          Emergency
        </Link>
        <Link to="/ai-launch" data-cursor-big="true">
          Tavi
        </Link>
        <button className="login-btn" onClick={() => navigate("/login")}>
          Login / Sign up
        </button>
      </div>
    </nav>
  );
}
