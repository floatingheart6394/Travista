import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiChevronRight,
  FiCamera,
  FiCloud,
  FiDownload,
  FiEdit2,
  FiGlobe,
  FiHelpCircle,
  FiLogOut,
  FiSave,
  FiShield,
  FiUserPlus,
  FiZap,
} from "react-icons/fi";

import NewNavbar from "../components/NewNavbar";
import { fetchProfile, updateProfile } from "../services/profileService";

const SETTINGS_KEY = "travista.profile.settings";
const PROFILE_PUBLIC_KEY = "travista.profile.public";
const PROFILE_DETAILS_KEY = "travista.profile.details";

function readPublicProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_PUBLIC_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      fullName: parsed.fullName || "",
      username: parsed.username || "",
      bio: parsed.bio || "",
      photoDataUrl: parsed.photoDataUrl || "",

      currentCity: parsed.currentCity || "",
      country: parsed.country || "",
      travelPersona: parsed.travelPersona || "",
      travelFrequency: parsed.travelFrequency || "",
      languagesSpoken: parsed.languagesSpoken || "",
      preferredTravelStyle: parsed.preferredTravelStyle || "",
    };
  } catch {
    return {
      fullName: "",
      username: "",
      bio: "",
      photoDataUrl: "",

      currentCity: "",
      country: "",
      travelPersona: "",
      travelFrequency: "",
      languagesSpoken: "",
      preferredTravelStyle: "",
    };
  }
}

function readPersonalDetails() {
  try {
    const raw = localStorage.getItem(PROFILE_DETAILS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      phoneNumber: parsed.phoneNumber || "",
      email: parsed.email || "",

      emergencyName: parsed.emergencyName || "",
      emergencyNumber: parsed.emergencyNumber || "",
      emergencyRelationship: parsed.emergencyRelationship || "",

      dateOfBirth: parsed.dateOfBirth || "",
      gender: parsed.gender || "",

      addressCountry: parsed.addressCountry || "",
      addressState: parsed.addressState || "",
      addressCity: parsed.addressCity || "",

      twoFactorEnabled: Boolean(parsed.twoFactorEnabled),
    };
  } catch {
    return {
      phoneNumber: "",
      email: "",
      emergencyName: "",
      emergencyNumber: "",
      emergencyRelationship: "",
      dateOfBirth: "",
      gender: "",
      addressCountry: "",
      addressState: "",
      addressCity: "",
      twoFactorEnabled: false,
    };
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

export default function ProfilePage() {
  const navigate = useNavigate();

  const mainRef = useRef(null);

  const [isSignoutOpen, setIsSignoutOpen] = useState(false);

  const [activePanel, setActivePanel] = useState(null);

  const initialProfile = useMemo(() => readPublicProfile(), []);
  const initialDetails = useMemo(() => readPersonalDetails(), []);

  // Display name shown in header (updates only after save)
  const [displayName, setDisplayName] = useState(
    String(initialProfile.fullName || "").trim() || "Alex Thompson"
  );

  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [username, setUsername] = useState(initialProfile.username);
  const [bio, setBio] = useState(initialProfile.bio);
  const [photoDataUrl, setPhotoDataUrl] = useState(initialProfile.photoDataUrl);

  const [currentCity, setCurrentCity] = useState(initialProfile.currentCity);
  const [country, setCountry] = useState(initialProfile.country);
  const [travelPersona, setTravelPersona] = useState(initialProfile.travelPersona);
  const [travelFrequency, setTravelFrequency] = useState(initialProfile.travelFrequency);
  const [languagesSpoken, setLanguagesSpoken] = useState(initialProfile.languagesSpoken);
  const [preferredTravelStyle, setPreferredTravelStyle] = useState(
    initialProfile.preferredTravelStyle
  );

  const [isProfileSaved, setIsProfileSaved] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState(initialDetails.phoneNumber);
  const [email, setEmail] = useState(initialDetails.email);

  const [emergencyName, setEmergencyName] = useState(initialDetails.emergencyName);
  const [emergencyNumber, setEmergencyNumber] = useState(initialDetails.emergencyNumber);
  const [emergencyRelationship, setEmergencyRelationship] = useState(
    initialDetails.emergencyRelationship
  );

  const [dateOfBirth, setDateOfBirth] = useState(initialDetails.dateOfBirth);
  const [gender, setGender] = useState(initialDetails.gender);

  const [addressCountry, setAddressCountry] = useState(initialDetails.addressCountry);
  const [addressState, setAddressState] = useState(initialDetails.addressState);
  const [addressCity, setAddressCity] = useState(initialDetails.addressCity);

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(initialDetails.twoFactorEnabled);
  const [isDetailsSaved, setIsDetailsSaved] = useState(false);

  // Load profile from backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchProfile();
        if (!mounted) return;
        setFullName(data.name || "");
        setDisplayName(data.name || "Alex Thompson");
        setEmail(data.email || "");
        if (data.profile_image_url) {
          setPhotoDataUrl(data.profile_image_url);
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const name = String(displayName || "").trim() || "Alex Thompson";

  useEffect(() => {
    if (!isProfileSaved) return;
    const t = setTimeout(() => setIsProfileSaved(false), 1600);
    return () => clearTimeout(t);
  }, [isProfileSaved]);

  useEffect(() => {
    if (!isDetailsSaved) return;
    const t = setTimeout(() => setIsDetailsSaved(false), 1600);
    return () => clearTimeout(t);
  }, [isDetailsSaved]);

  const defaultSettings = useMemo(
    () => ({
      notifications: true,
      aiAssistant: true,
      smartRecommendations: true,
      aiPhotoEnhancement: true,
      locationIntelligence: true,
    }),
    []
  );

  const [settings, setSettings] = useState(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return { ...defaultSettings, ...parsed };
    } catch {
      return defaultSettings;
    }
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const onPickPhoto = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      setPhotoDataUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const onSaveProfile = async () => {
    const payload = {
      fullName: String(fullName || "").trim(),
      username: String(username || "").trim(),
      bio: String(bio || "").trim(),
      photoDataUrl: photoDataUrl || "",

      currentCity: String(currentCity || "").trim(),
      country: String(country || "").trim(),
      travelPersona: String(travelPersona || "").trim(),
      travelFrequency: String(travelFrequency || "").trim(),
      languagesSpoken: String(languagesSpoken || "").trim(),
      preferredTravelStyle: String(preferredTravelStyle || "").trim(),
    };
    localStorage.setItem(PROFILE_PUBLIC_KEY, JSON.stringify(payload));

    try {
      await updateProfile({
        name: payload.fullName,
        email: email || "",
        profile_image_url: photoDataUrl || null,
      });
      setDisplayName(payload.fullName || "Alex Thompson");
      setIsProfileSaved(true);
    } catch (err) {
      console.error("Profile update failed", err);
      setIsProfileSaved(false);
      alert(err.message || "Failed to save profile");
    }
  };

  const onSaveDetails = async () => {
    const payload = {
      phoneNumber: String(phoneNumber || "").trim(),
      email: String(email || "").trim(),

      emergencyName: String(emergencyName || "").trim(),
      emergencyNumber: String(emergencyNumber || "").trim(),
      emergencyRelationship: String(emergencyRelationship || "").trim(),

      dateOfBirth: String(dateOfBirth || "").trim(),
      gender: String(gender || "").trim(),

      addressCountry: String(addressCountry || "").trim(),
      addressState: String(addressState || "").trim(),
      addressCity: String(addressCity || "").trim(),

      twoFactorEnabled: Boolean(twoFactorEnabled),
    };
    localStorage.setItem(PROFILE_DETAILS_KEY, JSON.stringify(payload));
    try {
      await updateProfile({
        name: fullName || "",
        email: payload.email,
        profile_image_url: photoDataUrl || null,
      });
      setDisplayName(fullName || "Alex Thompson");
      setIsDetailsSaved(true);
    } catch (err) {
      console.error("Details update failed", err);
      setIsDetailsSaved(false);
      alert(err.message || "Failed to save details");
    }
  };

  const openPanel = (key) => {
    setActivePanel(key);
    requestAnimationFrame(() => {
      mainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const quickSettings = [
    {
      key: "notifications",
      title: "Notifications",
      icon: <FiBell />,
      right: (
        <label className="switch" aria-label="Toggle notifications">
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={(e) =>
              setSettings((s) => ({ ...s, notifications: e.target.checked }))
            }
          />
          <span className="slider" />
        </label>
      ),
    },
    {
      key: "privacy",
      title: "Privacy",
      icon: <FiShield />,
      right: <FiChevronRight className="chev" />,
      onClick: () => {},
    },
    {
      key: "help",
      title: "Help & Support",
      icon: <FiHelpCircle />,
      right: <FiChevronRight className="chev" />,
      onClick: () => {},
    },
    {
      key: "language",
      title: "Language",
      icon: <FiGlobe />,
      rightValue: "English",
      right: <FiChevronRight className="chev" />,
      onClick: () => {},
    },
  ];


  const accountItems = [
    {
      key: "edit",
      title: "Edit Profile",
      icon: <FiEdit2 />,
      onClick: () => openPanel("edit"),
    },
    {
      key: "details",
      title: "Personal Details",
      icon: <FiShield />,
      onClick: () => openPanel("details"),
    },
    {
      key: "download",
      title: "Download Report",
      icon: <FiDownload />,
      onClick: () => openPanel("download"),
    },
    {
      key: "backup",
      title: "Backup & Sync",
      icon: <FiCloud />,
      onClick: () => openPanel("backup"),
    },
    {
      key: "invite",
      title: "Invite Friends",
      icon: <FiUserPlus />,
      onClick: () => openPanel("invite"),
    },
    {
      key: "rate",
      title: "Rate Travista",
      icon: <FiZap />,
      onClick: () => openPanel("rate"),
    },
    {
      key: "signout",
      title: "Sign Out",
      icon: <FiLogOut />,
      onClick: () => setIsSignoutOpen(true),
    },
  ];

  return (
    <div className="dashboard-page profile-page">
      <NewNavbar />

      <main className="dashboard-content profile2-content">
        <div className="profile2-layout">
          <aside className="profile2-sidebar">
            <section className="profile2-card profile2-photoCard">
              <div className="profile-identity">
                <div className="profile-identityAvatar" aria-hidden="true">
                  {initialsFromName(name)}
                </div>
                <div className="profile-identityTexts">
                  <div className="profile-identityName">{name}</div>
                  <div className="profile-identityEmail">
                    {email || "you@example.com"}
                  </div>
                </div>
              </div>
            </section>

            <section className="profile2-card">
              <div className="profile2-cardTitle">Account</div>
              <div className="settings-list">
                {accountItems.map((row) => (
                  <div
                    key={row.key}
                    className="profile-row"
                    role="button"
                    tabIndex={0}
                    onClick={row.onClick}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") row.onClick();
                    }}
                  >
                    <div className="ico" aria-hidden="true">
                      {row.icon}
                    </div>
                    <div>
                      <div className="title">{row.title}</div>
                    </div>
                    <FiChevronRight className="chev" />
                  </div>
                ))}
              </div>
              <div className="profile-footer">Travista v1.0.0</div>
            </section>

            <section className="profile2-card">
              <div className="profile2-cardTitle">Quick Settings</div>
              <div className="settings-list">
                {quickSettings.map((row) => (
                  <div
                    key={row.key}
                    className="profile-row"
                    role={row.onClick ? "button" : undefined}
                    tabIndex={row.onClick ? 0 : undefined}
                    onClick={row.onClick}
                    onKeyDown={(e) => {
                      if (!row.onClick) return;
                      if (e.key === "Enter" || e.key === " ") row.onClick();
                    }}
                  >
                    <div className="ico" aria-hidden="true">
                      {row.icon}
                    </div>
                    <div>
                      <div className="title">{row.title}</div>
                      {row.subtitle && <div className="sub">{row.subtitle}</div>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {row.rightValue && <span className="value">{row.rightValue}</span>}
                      {row.right}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <section className="profile2-main" ref={mainRef}>
            {activePanel === "edit" && (
              <div className="account-layout">
                <aside className="account-left">
                  <section className="profile2-card account-photoCard">
                    <div className="account-photoArea">
                      {photoDataUrl ? (
                        <img className="account-photoImg" alt="Profile" src={photoDataUrl} />
                      ) : (
                        <div className="account-photoFallback" aria-hidden="true">
                          {initialsFromName(name)}
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="profile2-card account-uploadCard">
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

                  <section className="profile2-card account-preferencesCard">
                    <div className="account-photoBody">
                      <div className="account-photoTitle">Preferences</div>

                      <div className="account-field account-fieldFull">
                        <label>Languages Spoken</label>
                        <input
                          type="text"
                          value={languagesSpoken}
                          onChange={(e) => setLanguagesSpoken(e.target.value)}
                          placeholder="e.g. English, Tamil"
                        />
                      </div>

                      <div className="account-field account-fieldFull">
                        <label>Preferred Travel Style</label>
                        <select
                          value={preferredTravelStyle}
                          onChange={(e) => setPreferredTravelStyle(e.target.value)}
                        >
                          <option value="">Select</option>
                          <option value="Solo">Solo</option>
                          <option value="Friends">Friends</option>
                          <option value="Family">Family</option>
                        </select>
                      </div>
                    </div>
                  </section>
                </aside>

                <section className="profile2-card account-formCard">
                  <div className="account-formGrid">
                    <div className="account-sectionTitle">Profile Information</div>

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
                      <label>Biographical Info</label>
                      <textarea
                        rows={4}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder='e.g. “Solo traveler & foodie”'
                      />
                    </div>

                    <div className="account-sectionTitle">Travel Context</div>

                    <div className="account-field">
                      <label>Current City</label>
                      <input
                        type="text"
                        value={currentCity}
                        onChange={(e) => setCurrentCity(e.target.value)}
                        placeholder="e.g. Chennai"
                      />
                    </div>

                    <div className="account-field">
                      <label>Country</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="e.g. India"
                      />
                    </div>

                    <div className="account-field">
                      <label>Travel Persona</label>
                      <select
                        value={travelPersona}
                        onChange={(e) => setTravelPersona(e.target.value)}
                      >
                        <option value="">Select</option>
                        <option value="Explorer">Explorer</option>
                        <option value="Foodie">Foodie</option>
                        <option value="Adventure">Adventure</option>
                        <option value="Relaxed">Relaxed</option>
                        <option value="Cultural">Cultural</option>
                      </select>
                    </div>

                    <div className="account-field">
                      <label>Travel Frequency</label>
                      <select
                        value={travelFrequency}
                        onChange={(e) => setTravelFrequency(e.target.value)}
                      >
                        <option value="">Select</option>
                        <option value="Rare">Rare</option>
                        <option value="Occasional">Occasional</option>
                        <option value="Frequent">Frequent</option>
                      </select>
                    </div>
                  </div>

                  <div className="account-actionsRow">
                    <button
                      className="account-save secondary"
                      type="button"
                      onClick={() => setActivePanel(null)}
                    >
                      Done
                    </button>
                    <button className="account-save" type="button" onClick={onSaveProfile}>
                      <FiSave />
                      <span>{isProfileSaved ? "Saved" : "Save Changes"}</span>
                    </button>
                  </div>
                </section>
              </div>
            )}

            {activePanel === "details" && (
              <section className="profile2-card account-formCard">
                <div className="account-formGrid">
                  <div className="account-sectionTitle">Contact Info</div>

                  <div className="account-field">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Verified phone number"
                    />
                  </div>

                  <div className="account-field">
                    <label>Email</label>
                     <input
                       type="email"
                       value={email}
                       placeholder="name@example.com"
                       readOnly
                     />
                  </div>

                  <div className="account-sectionTitle">Emergency</div>

                  <div className="account-field">
                    <label>Emergency Contact Name</label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="Contact person name"
                    />
                  </div>

                  <div className="account-field">
                    <label>Emergency Contact Number</label>
                    <input
                      type="tel"
                      value={emergencyNumber}
                      onChange={(e) => setEmergencyNumber(e.target.value)}
                      placeholder="Contact phone number"
                    />
                  </div>

                  <div className="account-field account-fieldFull">
                    <label>Relationship</label>
                    <input
                      type="text"
                      value={emergencyRelationship}
                      onChange={(e) => setEmergencyRelationship(e.target.value)}
                      placeholder="e.g. Parent, Friend, Spouse"
                    />
                  </div>

                  <div className="account-sectionTitle">Identity (Optional)</div>

                  <div className="account-field">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </div>

                  <div className="account-field">
                    <label>Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="">Prefer not to say</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="account-sectionTitle">Address (Optional)</div>

                  <div className="account-field">
                    <label>Country</label>
                    <input
                      type="text"
                      value={addressCountry}
                      onChange={(e) => setAddressCountry(e.target.value)}
                      placeholder="Country"
                    />
                  </div>

                  <div className="account-field">
                    <label>State</label>
                    <input
                      type="text"
                      value={addressState}
                      onChange={(e) => setAddressState(e.target.value)}
                      placeholder="State / Region"
                    />
                  </div>

                  <div className="account-field account-fieldFull">
                    <label>City</label>
                    <input
                      type="text"
                      value={addressCity}
                      onChange={(e) => setAddressCity(e.target.value)}
                      placeholder="City"
                    />
                  </div>

                </div>

                <div className="account-actionsRow">
                  <button
                    className="account-save secondary"
                    type="button"
                    onClick={() => setActivePanel(null)}
                  >
                    Done
                  </button>
                  <button className="account-save" type="button" onClick={onSaveDetails}>
                    <FiSave />
                    <span>{isDetailsSaved ? "Saved" : "Save Changes"}</span>
                  </button>
                </div>
              </section>
            )}

            {activePanel && activePanel !== "edit" && activePanel !== "details" && (
              <section className="profile2-card">
                <div className="profile2-panelTitle">{accountItems.find((x) => x.key === activePanel)?.title}</div>
                <div className="profile2-empty">Coming next.</div>
              </section>
            )}
          </section>
        </div>
      </main>

      {isSignoutOpen && (
        <div
          className="tv-modalOverlay"
          role="dialog"
          aria-modal="true"
          aria-label="Sign out confirmation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsSignoutOpen(false);
          }}
        >
          <div className="tv-modal">
            <div className="tv-modalTitle">Sign out</div>
            <div className="tv-modalText">Are you sure you want to sign out?</div>
            <div className="tv-modalActions">
              <button
                className="tv-btn secondary"
                type="button"
                onClick={() => setIsSignoutOpen(false)}
              >
                Cancel
              </button>
              <button
                className="tv-btn danger"
                type="button"
                onClick={() => {
                  localStorage.removeItem("access_token");
                  setIsSignoutOpen(false);
                  navigate("/login");
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
