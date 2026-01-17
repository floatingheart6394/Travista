import { useEffect, useState } from "react";
import NewNavbar from "../components/NewNavbar";
import {
  FiMapPin,
  FiPhoneCall,
  FiShield,
  FiSearch,
  FiFilter,
  FiMap,
  FiList,
  FiPlus,
  FiUser,
  FiDollarSign,
} from "react-icons/fi";
import {
  FaAmbulance,
  FaFireExtinguisher,
  FaHospitalAlt,
  FaClinicMedical,
  FaCapsules,
  FaFemale
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  fetchEmergencyContacts,
  addEmergencyContact,
  deleteEmergencyContact,
} from "../services/emergencyContact";
import EmergencyMap from "../components/EmergencyMap";

export default function EmergencyPage() {
  const [view, setView] = useState("list");
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    async function loadContacts() {
      try {
        const data = await fetchEmergencyContacts();
        setContacts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingContacts(false);
      }
    }

    loadContacts();
  }, []);
  const toTel = (p) => (p || "").replace(/[^+\d]/g, "");
  const navigate = useNavigate();
  const startWith = (q) => navigate(`/ai?q=${encodeURIComponent(q)}`);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    relation: "",
  });
  const [saving, setSaving] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [maxDistance, setMaxDistance] = useState(10); // km
  const [showChangeLocation, setShowChangeLocation] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [cityResults, setCityResults] = useState([]);

  const CATEGORY_CONFIG = {
    all: {
      label: "All Services",
      tags: [
        '["amenity"="hospital"]',
        '["amenity"="police"]',
        '["amenity"="pharmacy"]',
        '["amenity"="fire_station"]',
        '["amenity"="atm"]',
      ],
      icon: <FiList />,
    },
    hospital: {
      label: "Medical Facilities",
      tags: ['["amenity"="hospital"]'],
      icon: <FaHospitalAlt />,
    },
    police: {
      label: "Law Enforcement",
      tags: ['["amenity"="police"]'],
      icon: <FiShield />,
    },
    pharmacy: {
      label: "Pharmacies",
      tags: ['["amenity"="pharmacy"]'],
      icon: <FaCapsules />,
    },
    fire: {
      label: "Fire Services",
      tags: ['["amenity"="fire_station"]'],
      icon: <FaFireExtinguisher />,
    },
    atm: {
      label: "ATMs",
      tags: ['["amenity"="atm"]'],
      icon: <FiDollarSign />,
    },
  };

  async function fetchNearbyPlaces(lat, lon, category) {
    const tags = CATEGORY_CONFIG[category].tags;

    const queryParts = tags
      .map(
        (tag) => `
        node${tag}(around:5000,${lat},${lon});
        way${tag}(around:5000,${lat},${lon});
      `
      )
      .join("");

    const query = `
    [out:json];
    (
      ${queryParts}
    );
    out center tags;
  `;

    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
    });

    const data = await res.json();
    return data.elements;
  }

  useEffect(() => {
    if (!userLocation) return;

    async function loadPlaces() {
      setLoadingPlaces(true);
      try {
        const data = await fetchNearbyPlaces(
          userLocation.lat,
          userLocation.lon,
          activeCategory
        );
        setPlaces(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPlaces(false);
      }
    }

    loadPlaces();
  }, [userLocation, activeCategory]);

  const categories = [
    { key: "all", icon: <FiList />, label: "All Services" },
    { key: "hospital", icon: <FaClinicMedical />, label: "Medical Facilities" },
    { key: "police", icon: <FiShield />, label: "Law Enforcement" },
    { key: "pharmacy", icon: <FaCapsules />, label: "Pharmacies" },
    { key: "fire", icon: <FaFireExtinguisher />, label: "Fire Services" },
    { key: "atm", icon: <FiDollarSign />, label: "ATMs" },
  ];

  const filteredPlaces = places
    .filter((p) =>
      (p.tags?.name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .map((p) => {
      const lat = p.lat ?? p.center?.lat;
      const lon = p.lon ?? p.center?.lon;
      if (!lat || !lon || !userLocation) return null;

      return {
        ...p,
        _distance: Number(getDistanceKm(
          userLocation.lat,
          userLocation.lon,
          lat,
          lon
        )),
      };
    })
    .filter(Boolean)
    .filter((p) => p._distance <= maxDistance)
    .sort((a, b) => sortByDistance ? a._distance - b._distance : 0);

  function getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
  }
  async function searchCity(query) {
    if (!query) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query
      )}&limit=5`
    );

    const data = await res.json();
    setCityResults(data);
  }

  return (
    <div className="dashboard-page">
      <NewNavbar />
      <main className="dashboard-content">
        <div className="emer-layout">
          {/* Location banner */}
          <section className="emer-location">
            <div className="left">
              <span className="loc-icon">
                <FiMapPin />
              </span>
              <div>
                <div className="loc-title">
                  Current Location <span className={`chip ${isTrackingLocation ? "active" : ""}`}>
                    {isTrackingLocation ? "Active" : "Not Active"}
                  </span>
                </div>
                <div className="loc-sub">
                  {isTrackingLocation
                    ? "Using your current location"
                    : userLocation
                      ? "Using selected location"
                      : "Location not set"}
                </div>

              </div>
            </div>
            <div className="loc-actions">
              <button
                className="textlink"
                onClick={() => setShowChangeLocation(true)}
              >
                Change Location
              </button>

              <button
                className="textlink"
                onClick={() => {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => {
                      setUserLocation({
                        lat: pos.coords.latitude,
                        lon: pos.coords.longitude,
                      });
                      setIsTrackingLocation(true);
                    },
                    console.error,
                    {
                      enableHighAccuracy: true,
                      maximumAge: 0,
                    }
                  );
                }}
              >
                Use Current Location
              </button>
            </div>
          </section>
          {/* Hotlines */}
          <section className="emer-hotlines">
            <h2>Emergency Hotlines</h2>
            <div className="hotline-grid">
              <div className="hot-card"
                onClick={() => window.location.href = "tel:181"}
                style={{ cursor: "pointer" }}>
                <div className="hot-head">
                  <span className="hot-icon">
                    <FaFemale />
                  </span>
                  <a className="hot-call" href="tel:181">
                    <FiPhoneCall />
                  </a>
                </div>
                <div className="hot-number">181</div>
                <div className="hot-title">Women Helpline</div>
                <div className="hot-sub">Women safety & emergency</div>
              </div>
              <div className="hot-card"
                onClick={() => window.location.href = "tel:100"}
                style={{ cursor: "pointer" }}>
                <div className="hot-head">
                  <span className="hot-icon">
                    <FiShield />
                  </span>
                  <a className="hot-call" href="tel:100">
                    <FiPhoneCall />
                  </a>
                </div>
                <div className="hot-number">100</div>
                <div className="hot-title">Police</div>
                <div className="hot-sub">Law enforcement</div>
              </div>
              <div className="hot-card"
                onClick={() => window.location.href = "tel:108"}
                style={{ cursor: "pointer" }}>
                <div className="hot-head">
                  <span className="hot-icon">
                    <FaAmbulance />
                  </span>
                  <a className="hot-call" href="tel:108">
                    <FiPhoneCall />
                  </a>
                </div>
                <div className="hot-number">108</div>
                <div className="hot-title">Medical Emergency</div>
                <div className="hot-sub">Free ambulance</div>
              </div>
              <div className="hot-card"
                onClick={() => window.location.href = "tel:101"}
                style={{ cursor: "pointer" }}>
                <div className="hot-head">
                  <span className="hot-icon">
                    <FaFireExtinguisher />
                  </span>
                  <a className="hot-call" href="tel:101">
                    <FiPhoneCall />
                  </a>
                </div>
                <div className="hot-number">101</div>
                <div className="hot-title">Fire Department</div>
                <div className="hot-sub">Fire & rescue</div>
              </div>
            </div>
          </section>

          {/* Search + toggles */}
          <div className="emer-searchbar">
            <div className="search-wrap">
              <FiSearch />
              <input
                placeholder="Search for services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="actions">
              <button className="outline" onClick={() => setShowFilters(true)}>
                <FiFilter /> Filters
              </button>
              <div className="toggle">
                <button
                  className={`tbtn ${view === "list" ? "active" : ""}`}
                  onClick={() => setView("list")}
                >
                  <FiList /> List
                </button>
                <button
                  className={`tbtn ${view === "map" ? "active" : ""}`}
                  onClick={() => setView("map")}
                >
                  <FiMap /> Map
                </button>
              </div>
            </div>
          </div>

          {/* Two-column content */}
          <div className="emer-two-col">
            {/* Left sidebar */}
            <aside className="emer-sidebar">
              <div className="card">
                <h3>Service Categories</h3>
                <ul className="cat-list">
                  {categories.map((c) => (
                    <li
                      key={c.key}
                      className={activeCategory === c.key ? "active" : ""}
                      onClick={() => setActiveCategory(c.key)}
                      style={{ cursor: "pointer" }}
                    >
                      <span className="cat-ico">{c.icon}</span>
                      <span className="cat-name">{c.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card contacts">
                <div className="card-head">
                  <h3>Emergency Contacts</h3>
                  {contacts.length < 3 && (
                    <button
                      className="icon-sm"
                      aria-label="Add contact"
                      title="Add contact"
                      onClick={() => setShowModal(true)}
                    >
                      <FiPlus />
                    </button>
                  )}
                  {showModal && (
                    <div className="modal-backdrop">
                      <div className="modal">
                        <h3>Add Emergency Contact</h3>

                        <input
                          type="text"
                          placeholder="Contact Name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />

                        <input
                          type="tel"
                          placeholder="Phone Number"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        />

                        <input
                          type="text"
                          placeholder="Relation (optional)"
                          value={form.relation}
                          onChange={(e) => setForm({ ...form, relation: e.target.value })}
                        />

                        <div className="modal-actions">
                          <button
                            className="outline"
                            onClick={() => {
                              setShowModal(false);
                              setForm({ name: "", phone: "", relation: "" });
                            }}
                          >
                            Cancel
                          </button>

                          <button
                            className="primary"
                            disabled={saving}
                            onClick={async () => {
                              if (!form.name || !form.phone) {
                                alert("Name and phone are required");
                                return;
                              }

                              try {
                                setSaving(true);
                                const newContact = await addEmergencyContact(form);
                                setContacts((prev) => [...prev, newContact]);
                                setShowModal(false);
                                setForm({ name: "", phone: "", relation: "" });
                              } catch (err) {
                                alert(err.message || "Failed to add contact");
                              } finally {
                                setSaving(false);
                              }
                            }}
                          >
                            {saving ? "Saving..." : "Save Contact"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {loadingContacts && <p>Loading contacts...</p>}
                {error && <p className="error">{error}</p>}

                {contacts.map((c) => (
                  <div key={c.id} className="contact-card">
                    <div className="contact-head">
                      <div className="qicon">
                        <FiUser />
                      </div>
                      <div className="qmain">
                        <div className="qtitle">{c.name}</div>
                        <div className="qsub">{c.relation || "Emergency Contact"}</div>
                      </div>
                    </div>

                    <a className="phone-chip" href={`tel:${toTel(c.phone)}`}>
                      {c.phone}
                    </a>

                    <div className="contact-actions">
                      <a className="cta-call" href={`tel:${toTel(c.phone)}`}>
                        <FiPhoneCall /> <span>Call Now</span>
                      </a>

                      <button
                        className="danger"
                        onClick={async () => {
                          await deleteEmergencyContact(c.id);
                          setContacts((prev) => prev.filter((x) => x.id !== c.id));
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            {/* Main content */}
            <section className="emer-main">

              <div className="card">
                <div className="list-head">
                  <h3>
                    Nearby {CATEGORY_CONFIG[activeCategory].label}{" "}
                    <span className="muted">({filteredPlaces.length} results)</span>
                  </h3>
                  {view === "list" && (
                  <div
                    className="sortby"
                    style={{ cursor: "pointer" }}
                    onClick={() => setSortByDistance((prev) => !prev)}
                  >
                    Sort by{" "}
                    <strong>
                      {sortByDistance ? "Distance" : "Default"}
                    </strong>{" "}
                    ▾
                  </div>
                  )}
                </div>
                <div className="listings">
                  {view === "list" && (
                    <>
                      {loadingPlaces && (
                        <p>
                          Loading nearby {CATEGORY_CONFIG[activeCategory].label.toLowerCase()}...
                        </p>
                      )}

                      {filteredPlaces.map((p) => {
                        const name = p.tags?.name || "Unnamed Service";
                        const address =
                          p.tags?.["addr:full"] ||
                          `${p.tags?.["addr:street"] || ""} ${p.tags?.["addr:city"] || ""}`;

                        const lat = p.lat ?? p.center?.lat;
                        const lon = p.lon ?? p.center?.lon;
                        if (!lat || !lon) return null;

                        const distance = userLocation
                          ? getDistanceKm(
                            userLocation.lat,
                            userLocation.lon,
                            lat,
                            lon
                          )
                          : null;

                        const amenity = p.tags?.amenity || "service";
                        const phone = p.tags?.phone || p.tags?.["contact:phone"];

                        return (
                          <article key={p.id} className="place">
                            <div className="pl-ico">
                              <FaHospitalAlt />
                            </div>

                            <div className="pl-main">
                              <h4>{name}</h4>
                              <div className="pl-type">
                                {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                              </div>
                              <div className="pl-meta">
                                📍 {address || "Address not available"}
                              </div>
                            </div>

                            <div className="pl-actions">
                              {distance && <div className="distance">{distance} km away</div>}
                              <div className="buttons">
                                <a
                                  className="primary"
                                  href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Get Directions
                                </a>
                                {phone && (
                                  <a href={`tel:${toTel(phone)}`} className="outline">
                                    <FiPhoneCall /> Call
                                  </a>
                                )}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </>
                  )}

                  {view === "map" && (
                    <EmergencyMap
                      userLocation={userLocation}
                      places={filteredPlaces}
                    />
                  )}
                </div>
              </div>

              {/* Embassy card */}
              {/*<div className="embassy">
                <div className="emb-ico">
                  <FaLandmark />
                </div>
                <div className="emb-body">
                  <h3>U.S. Embassy Paris</h3>
                  <div>2 Avenue Gabriel, 75008 Paris</div>
                  <div>+33 1 43 12 22 22</div>
                  <div>Mon–Fri: 9:00 AM – 5:00 PM</div>
                  <div className="emb-actions">
                    <button className="emb-primary">Contact Embassy</button>
                    <button className="emb-outline">Emergency Line</button>
                  </div>
                </div>
              </div>*/}
            </section>
          </div>
        </div>
      </main>
      {
        showFilters && (
          <div className="modal-backdrop">
            <div className="modal">
              <h3>Filters</h3>

              <label>
                Maximum distance: <strong>{maxDistance} km</strong>
              </label>

              <input
                type="range"
                min="1"
                max="25"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
              />

              <div className="modal-actions">
                <button
                  className="outline"
                  onClick={() => setShowFilters(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }
      {userLocation && (
        <pre style={{ fontSize: 12 }}>
          {JSON.stringify(userLocation, null, 2)}
        </pre>
      )}
      {showChangeLocation && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Change Location</h3>

            <input
              type="text"
              placeholder="Enter city or area (e.g., Coimbatore)"
              value={cityQuery}
              onChange={(e) => {
                setCityQuery(e.target.value);
                searchCity(e.target.value);
              }}
            />

            <div className="city-results">
              {cityResults.map((c) => (
                <div
                  key={c.place_id}
                  className="city-item"
                  onClick={() => {
                    setUserLocation({
                      lat: Number(c.lat),
                      lon: Number(c.lon),
                    });
                    setIsTrackingLocation(false); // manual location
                    setPlaces([]); // clear old data
                    setShowChangeLocation(false);
                    setCityResults([]);
                    setCityQuery("");
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {c.display_name}
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button
                className="outline"
                onClick={() => setShowChangeLocation(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
