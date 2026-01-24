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
import { useEffect, useState } from "react";
import { fetchProfile } from "../services/profileService";

function initialsFromName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function NewNavbar() {
  const navigate = useNavigate();
  const [photoDataUrl, setPhotoDataUrl] = useState("");
  const [userName, setUserName] = useState("");

  const loadProfile = async () => {
    try {
      const data = await fetchProfile();
      setUserName(data.name || "");
      if (data.profile_image_url) {
        setPhotoDataUrl(data.profile_image_url);
      } else {
        setPhotoDataUrl("");
      }
    } catch (err) {
      console.error("Failed to load profile in navbar", err);
    }
  };

  useEffect(() => {
    loadProfile();

    // Listen for profile updates
    const handleStorageChange = (e) => {
      if (e.key === "travista.profile.public") {
        loadProfile();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom profile update events
    const handleProfileUpdate = () => {
      loadProfile();
    };
    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);
  return (
    <header className="newnav">
      <Link to="/dashboard" className="newnav-brand">
        TRAVISTA
      </Link>
      <nav className="newnav-menu">
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
          style={{
            padding: "0",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {photoDataUrl ? (
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "2px solid #FF9500",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f0f0f0",
              }}
            >
              <img
                src={photoDataUrl}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          ) : (
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                border: "2px solid #FF9500",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#FF9500",
                color: "white",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              {initialsFromName(userName)}
            </div>
          )}
        </button>
      </div>
    </header>
  );
}
