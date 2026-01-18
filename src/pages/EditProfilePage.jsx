import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCamera, FiSave } from "react-icons/fi";

import NewNavbar from "../components/NewNavbar";

const PROFILE_PUBLIC_KEY = "travista.profile.public";

function getInitialProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_PUBLIC_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      fullName: parsed.fullName || "",
      username: parsed.username || "",
      bio: parsed.bio || "",
      photoDataUrl: parsed.photoDataUrl || "",
    };
  } catch {
    return { fullName: "", username: "", bio: "", photoDataUrl: "" };
  }
}

function initialsFromName(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "TU";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function EditProfilePage() {
  const navigate = useNavigate();
  const initial = useMemo(() => getInitialProfile(), []);

  const [fullName, setFullName] = useState(initial.fullName);
  const [username, setUsername] = useState(initial.username);
  const [bio, setBio] = useState(initial.bio);
  const [photoDataUrl, setPhotoDataUrl] = useState(initial.photoDataUrl);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!isSaved) return;
    const t = setTimeout(() => setIsSaved(false), 1600);
    return () => clearTimeout(t);
  }, [isSaved]);

  const onPickPhoto = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setPhotoDataUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const onSave = () => {
    const payload = {
      fullName: String(fullName || "").trim(),
      username: String(username || "").trim(),
      bio: String(bio || "").trim(),
      photoDataUrl: photoDataUrl || "",
    };

    localStorage.setItem(PROFILE_PUBLIC_KEY, JSON.stringify(payload));
    setIsSaved(true);
  };

  const avatarInitials = initialsFromName(fullName);

  return (
    <div className="dashboard-page account-page">
      <NewNavbar />

      <main className="dashboard-content profile2-content">
        <div className="account-header">
          <button className="account-back" type="button" onClick={() => navigate("/profile")}
            aria-label="Back to Profile">
            <FiArrowLeft />
            <span>Back</span>
          </button>
          <div className="account-titleWrap">
            <div className="account-title">Edit Profile</div>
            <div className="account-sub">Update public identity</div>
          </div>
          <button className="account-save" type="button" onClick={onSave}>
            <FiSave />
            <span>{isSaved ? "Saved" : "Save Changes"}</span>
          </button>
        </div>

        <div className="account-layout">
          <aside className="account-left">
            <section className="profile2-card account-photoCard">
              <div className="account-photoArea">
                {photoDataUrl ? (
                  <img className="account-photoImg" alt="Profile" src={photoDataUrl} />
                ) : (
                  <div className="account-photoFallback" aria-hidden="true">
                    {avatarInitials}
                  </div>
                )}
              </div>
              <label className="account-uploadBtn">
                <FiCamera />
                <span>{photoDataUrl ? "Change Photo" : "Upload Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onPickPhoto(e.target.files?.[0])}
                />
              </label>
            </section>
          </aside>

          <section className="profile2-card account-formCard">
            <div className="account-formGrid">
              <div className="account-field">
                <label>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="account-field">
                <label>Username (optional)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. solofoodie"
                />
              </div>

              <div className="account-field account-fieldFull">
                <label>Short Bio</label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder='e.g. “Solo traveler & foodie”'
                />
              </div>
            </div>

            <div className="account-actionsRow">
              <button className="account-save secondary" type="button" onClick={() => navigate("/profile")}
                >Done</button>
              <button className="account-save" type="button" onClick={onSave}>
                <FiSave />
                <span>{isSaved ? "Saved" : "Save Changes"}</span>
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
