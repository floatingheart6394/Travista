import { useState } from "react";
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
  FiMessageCircle,
  FiDollarSign,
  FiFlag,
  FiHome,
  FiPlusCircle,
} from "react-icons/fi";
import { FaAmbulance, FaFireExtinguisher, FaHospitalAlt, FaClinicMedical, FaCapsules, FaLandmark } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function EmergencyPage() {
  const [view, setView] = useState("list");
  const toTel = (p) => (p || "").replace(/[^+\d]/g, "");
  const navigate = useNavigate();
  const startWith = (q) => navigate(`/ai?q=${encodeURIComponent(q)}`);

  const categories = [
    { icon: <FaClinicMedical />, label: "Medical Facilities", count: 8 },
    { icon: <FiShield />, label: "Law Enforcement", count: 5 },
    { icon: <FaCapsules />, label: "Pharmacies", count: 12 },
    { icon: <FiDollarSign />, label: "Financial Services", count: 15 },
    { icon: <FiFlag />, label: "Diplomatic Services", count: 1 },
    { icon: <FiHome />, label: "Walk-in Clinics", count: 6, active: true },
  ];

  const listings = [
    {
      name: "Hôpital Européen Georges-Pompidou",
      type: "Emergency Department",
      address: "20 Rue Leblanc, 75015 Paris, France",
      rating: 4.3,
      reviews: 892,
      phone: "+33 1 56 09 20 00",
      distance: "1.2 km",
      open: true,
      tags: ["Emergency Care", "Trauma", "ICU"],
    },
    {
      name: "Hôpital Saint-Joseph",
      type: "General Hospital",
      address: "185 Rue Raymond Losserand, 75014 Paris",
      rating: 4.1,
      reviews: 654,
      phone: "+33 1 44 12 33 33",
      distance: "2.4 km",
      open: true,
      tags: ["Emergency", "Surgery", "Cardiology"],
    },
  ];

  return (
    <div className="dashboard-page">
      <NewNavbar />
      <main className="dashboard-content">
        <div className="emer-layout">
          {/* Location banner */}
          <section className="emer-location">
            <div className="left">
              <span className="loc-icon"><FiMapPin /></span>
              <div>
                <div className="loc-title">Current Location <span className="chip active">Active</span></div>
                <div className="loc-sub">Paris, Île-de-France, France</div>
              </div>
            </div>
            <button className="textlink">Change Location</button>
          </section>

          {/* Hotlines */}
          <section className="emer-hotlines">
            <h2>Emergency Hotlines</h2>
            <div className="hotline-grid">
              <div className="hot-card">
                <div className="hot-head"><span className="hot-icon"><FiPhoneCall /></span><span className="hot-call"><FiPhoneCall /></span></div>
                <div className="hot-number">112</div>
                <div className="hot-title">General Emergency</div>
                <div className="hot-sub">All emergencies</div>
              </div>
              <div className="hot-card">
                <div className="hot-head"><span className="hot-icon"><FiShield /></span><span className="hot-call"><FiPhoneCall /></span></div>
                <div className="hot-number">17</div>
                <div className="hot-title">Police</div>
                <div className="hot-sub">Law enforcement</div>
              </div>
              <div className="hot-card">
                <div className="hot-head"><span className="hot-icon"><FaAmbulance /></span><span className="hot-call"><FiPhoneCall /></span></div>
                <div className="hot-number">15</div>
                <div className="hot-title">Medical Emergency</div>
                <div className="hot-sub">SAMU ambulance</div>
              </div>
              <div className="hot-card">
                <div className="hot-head"><span className="hot-icon"><FaFireExtinguisher /></span><span className="hot-call"><FiPhoneCall /></span></div>
                <div className="hot-number">18</div>
                <div className="hot-title">Fire Department</div>
                <div className="hot-sub">Fire & rescue</div>
              </div>
            </div>
          </section>

          {/* Search + toggles */}
          <div className="emer-searchbar">
            <div className="search-wrap">
              <FiSearch />
              <input placeholder="Search for services, facilities, or addresses..." />
            </div>
            <div className="actions">
              <button className="outline"><FiFilter /> Filters</button>
              <div className="toggle">
                <button className={`tbtn ${view==='list' ? 'active' : ''}`} onClick={() => setView('list')}><FiList /> List</button>
                <button className={`tbtn ${view==='map' ? 'active' : ''}`} onClick={() => setView('map')}><FiMap /> Map</button>
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
                  <li className="cat-all">All Services</li>
                  {categories.map((c) => (
                    <li key={c.label} className={c.active ? 'active' : ''}>
                      <span className="cat-ico">{c.icon}</span>
                      <span className="cat-name">{c.label}</span>
                      <span className="cat-count">{c.count}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card contacts">
                <div className="card-head">
                  <h3>Emergency Contacts</h3>
                  <button className="icon-sm" aria-label="Add contact"><FiPlus /></button>
                </div>

                <div className="contact-card">
                  <div className="contact-head">
                    <div className="qicon"><FiUser /></div>
                    <div className="qmain">
                      <div className="qtitle">Mom</div>
                      <div className="qsub">Family</div>
                    </div>
                  </div>
                  <a className="phone-chip" href={`tel:${toTel('+1 555 123 4567')}`}>+1 555 123 4567</a>
                  <a className="cta-call" href={`tel:${toTel('+1 555 123 4567')}`}>
                    <FiPhoneCall /> <span>Call Now</span>
                  </a>
                </div>

                <div className="contact-card">
                  <div className="contact-head">
                    <div className="qicon"><FiUser /></div>
                    <div className="qmain">
                      <div className="qtitle">Hotel Concierge</div>
                      <div className="qsub">Hotel</div>
                    </div>
                  </div>
                  <a className="phone-chip" href={`tel:${toTel('+33 1 42 60 30 30')}`}>+33 1 42 60 30 30</a>
                  <a className="cta-call" href={`tel:${toTel('+33 1 42 60 30 30')}`}>
                    <FiPhoneCall /> <span>Call Now</span>
                  </a>
                </div>
              </div>

              {/* AI Assistant card removed by request */}
            </aside>

            {/* Main content */}
            <section className="emer-main">
              {/* Safety alerts card removed per request */}

              <div className="card">
                <div className="list-head">
                  <h3>Nearby Locations <span className="muted">(4 results)</span></h3>
                  <div className="sortby">Sort by <strong>Distance</strong> ▾</div>
                </div>
                <div className="listings">
                  {listings.map((it) => (
                    <article key={it.name} className="place">
                      <div className="pl-ico"><FaHospitalAlt /></div>
                      <div className="pl-main">
                        <h4>{it.name}</h4>
                        <div className="pl-type">{it.type}</div>
                        <div className="pl-meta">📍 {it.address}</div>
                        <div className="pl-rate">⭐ {it.rating} <span className="muted">({it.reviews} reviews)</span>  ☎ {it.phone}</div>
                        <div className="pl-tags">
                          {it.tags.map(t => (<span key={t} className="tag">{t}</span>))}
                        </div>
                      </div>
                      <div className="pl-actions">
                        <div className="distance">
                          <strong>{it.distance}</strong>
                          <span className="open chip green">Open 24 Hours</span>
                        </div>
                        <div className="buttons">
                          <button className="primary">Get Directions</button>
                          <a className="outline" href={`tel:${toTel(it.phone)}`}><FiPhoneCall /> Call Now</a>
                          <button className="link">Details</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* Embassy card */}
              <div className="embassy">
                <div className="emb-ico"><FaLandmark /></div>
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
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
