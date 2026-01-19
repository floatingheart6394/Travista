import { useState, useEffect } from "react";
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
  "Devotional",
  "Family",
  "Nature",
  "Friends",
  "Photography",
  "History",
];
const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function PlannerPage() {
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState("");
  const [travelers, setTravelers] = useState("");
  const [tripStyles, setTripStyles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState("");
  const [error, setError] = useState("");

 /* useEffect(() => {
    async function loadTrip() {
      try {
        const res = await fetch(`${API_URL}/trip/active`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (res.status === 401) {
          console.error("Unauthorized – token missing or invalid");
          return;
        }
        const trip = await res.json();

        setDestination(trip.destination ?? "");
        setDuration(trip.duration ?? "");
        setBudget(trip.budget ?? "");
        setTravelers(trip.travelers ?? "");
        setTripStyles(trip.trip_styles ?? []);
      } catch (err) {
        console.error("Failed to load trip", err);
      }
    }

    loadTrip();
  }, []);
  */

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
      trip_styles: tripStyles,
    };

    if (!payload.destination || payload.duration < 1) {
      setError("Please enter a valid destination and duration.");
      return;
    }

    try {
      setLoading(true);
      
      // First, save the trip
      await fetch(`${API_URL}/trip/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(payload),
      });

      // Then, generate itinerary using OpenAI
      const prompt = `You are an expert travel planner. Create a detailed ${payload.duration}-day itinerary for ${payload.travelers} traveler(s) visiting ${payload.destination}. 
Budget: $${payload.budget} total
Travel Styles: ${payload.trip_styles.join(", ") || "General sightseeing"}

Provide a day-by-day itinerary with:
- Estimated costs for activities and meals
- Recommended restaurants and attractions
- Local tips and transportation advice
- Time management
- Budget breakdown

Format it clearly with each day as a section.`;

      const res = await fetch(`${API_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ message: prompt }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate itinerary");
      }

      const data = await res.json();
      setItinerary(data.reply);
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
                  <span className="label">Trip Duration (days)</span>
                </div>
                <input
                  type="number"
                  placeholder="0"
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
                  placeholder="0"
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
                placeholder="0"
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
