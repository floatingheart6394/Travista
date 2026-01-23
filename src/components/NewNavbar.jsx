import { MdExplore } from "react-icons/md";
import {
  FaPlaneDeparture,
  FaWallet,
  FaRobot,
  FaGamepad,
  FaCheckSquare,
} from "react-icons/fa";
import { MdEmergency } from "react-icons/md";
import { FiBell, FiUser } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

export default function NewNavbar() {
  const navigate = useNavigate();
  return (
    <header className="newnav">
      <Link to="/dashboard" className="newnav-brand">
        TRAVISTA
      </Link>
      <nav className="newnav-menu">
        <Link className="newnav-item" to="/dashboard">
          <span className="newnav-icon teal">
            <MdExplore />
          </span>
          <span>Explore</span>
        </Link>
        <Link className="newnav-item" to="/planner">
          <span className="newnav-icon blue">
            <FaPlaneDeparture />
          </span>
          <span>Trip Planner</span>
        </Link>
        <Link className="newnav-item" to="/budget">
          <span className="newnav-icon purple">
            <FaWallet />
          </span>
          <span>Budget</span>
        </Link>
        <Link className="newnav-item" to="/todo">
          <span className="newnav-icon green">
            <FaCheckSquare />
          </span>
          <span>To‑Do</span>
        </Link>
        <Link className="newnav-item" to="/ai">
          <span className="newnav-icon sky">
            <FaRobot />
          </span>
          <span>AI Assistant</span>
        </Link>
        <Link className="newnav-item" to="/game">
          <span className="newnav-icon amber">
            <FaGamepad />
          </span>
          <span>Game</span>
        </Link>
        <Link className="newnav-item" to="/emergency">
          <span className="newnav-icon red">
            <MdEmergency />
          </span>
          <span>Emergency</span>
        </Link>
      </nav>
      <div className="newnav-right">
        <button className="newnav-action" aria-label="Notifications">
          <FiBell />
        </button>
        <button
          className="newnav-action"
          aria-label="Profile"
          onClick={() => navigate("/profile")}
        >
          <FiUser />
        </button>
      </div>
    </header>
  );
}
