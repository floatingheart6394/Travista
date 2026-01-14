import { useState } from "react";
import {
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import NewNavbar from "../components/NewNavbar";

const STYLES = [
  "Adventure",
  "Relaxation",
  "Culture",
  "Food",
  "Nightlife",
  "Nature",
  "Shopping",
  "Photography",
  "History",
];
const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function PlannerPage() {
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("7");
  const [budget, setBudget] = useState("2500");
  const [travelers, setTravelers] = useState("2");
  const [tripStyles, setTripStyles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState("");
  const [error, setError] = useState("");

  const toggleStyle = (s) => {
    setTripStyles((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const handleGenerate = async () => {
    setError("");
    setItinerary("");

    const payload = {
      destination: destination.trim(),
      duration: Number(duration) || 0,
      budget: Number(budget) || 0,
      travelers: Number(travelers) || 1,
      tripStyles,
    };

    if (!payload.destination || payload.duration < 1) {
      setError("Please enter a valid destination and duration.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/planner/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Backend error:", errText);
        throw new Error(errText);
      }


      const data = await res.json();
      setItinerary(data.itinerary);
    } catch (err) {
      console.error(err);
      setError("⚠️ Unable to generate itinerary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <NewNavbar />
      <main className="dashboard-content">
        <div className="planner-layout">
          <section className="planner-card">
            <h2>Where do you want to go?</h2>
            <div className="planner-input full with-icon">
              <span className="ico">
                <FiMapPin />
              </span>
              <input
                type="text"
                placeholder="Enter destination (e.g., Tokyo, Paris, New York)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            <div className="planner-grid2">
              <label className="planner-field">
                <div className="field-head">
                  <span className="ico">
                    <FiCalendar />
                  </span>
                  <span className="label">Trip Duration</span>
                </div>
                <input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </label>
              <label className="planner-field">
                <div className="field-head">
                  <span className="ico">
                    <FiDollarSign />
                  </span>
                  <span className="label">Budget (USD)</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </label>
            </div>

            <label className="planner-field">
              <div className="field-head">
                <span className="ico">
                  <FiUsers />
                </span>
                <span className="label">Number of Travelers</span>
              </div>
              <input
                type="number"
                min="1"
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
              />
            </label>

            <div className="planner-field">
              <span className="label">Trip Style (Select all that apply)</span>
              <div className="planner-pills">
                {STYLES.map((s) => (
                  <button
                    key={s}
                    className={`pill ${tripStyles.includes(s) ? "active" : ""}`}
                    type="button"
                    onClick={() => toggleStyle(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="planner-actions">
              <button className="planner-generate" onClick={handleGenerate} disabled={loading}>
                <span className="bolt">
                  <FiZap />
                </span>
                Generate AI Itinerary
              </button>
            </div>
            {loading && (
              <p style={{ marginTop: "1rem" }}>
                ⏳ Generating your personalized itinerary...
              </p>
            )}

            {error && (
              <p style={{ marginTop: "1rem", color: "red" }}>
                {error}
              </p>
            )}

            {itinerary && (
              <div className="planner-result">
                <h3>Your AI Itinerary</h3>
                <pre style={{ whiteSpace: "pre-wrap" }}>
                  {itinerary}
                </pre>
              </div>
            )}
          </section>

          <aside className="planner-aside">
            <div className="panel gradient">
              <h3>AI-Powered Planning</h3>
              <p>
                Our advanced AI analyzes thousands of travel data points,
                reviews, and real-time information to create the perfect
                itinerary tailored to your preferences and budget.
              </p>
            </div>
            <div className="panel">
              <h3>What's Included</h3>
              <ul className="inc-list">
                <li>Day-by-day detailed itinerary</li>
                <li>Budget breakdown per day</li>
                <li>Restaurant recommendations</li>
                <li>Hotel suggestions</li>
                <li>Hidden gems & local spots</li>
                <li>Transportation routes</li>
              </ul>
            </div>
            <div className="panel">
              <h3>Popular Destinations</h3>
              <ul className="pop-list">
                <li>Paris, France</li>
                <li>Tokyo, Japan</li>
                <li>New York, USA</li>
                <li>Bangkok, Thailand</li>
                <li>Rome, Italy</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
