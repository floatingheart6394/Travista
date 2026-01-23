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

// Itinerary Display Component
function ItineraryDisplay({ itinerary }) {
  const parseItinerary = (text) => {
    const days = [];
    const seenDays = new Set(); // Track which days we've already added
    
    // Match "Day X:" patterns - more specific to avoid matching cost summaries
    const dayPattern = /^\s*day\s+(\d+)\s*:?/gim;
    let match;
    const dayIndices = [];
    
    // Find all occurrences of "Day X" at line start
    while ((match = dayPattern.exec(text)) !== null) {
      const dayNum = match[1];
      // Only add if we haven't seen this day number before
      if (!seenDays.has(dayNum)) {
        dayIndices.push({
          dayNum: dayNum,
          startIndex: match.index,
          matchLength: match[0].length
        });
        seenDays.add(dayNum);
      }
    }
    
    // If no day headers found, try more flexible pattern
    if (dayIndices.length === 0) {
      const flexiblePattern = /day\s+(\d+)/gi;
      while ((match = flexiblePattern.exec(text)) !== null) {
        const dayNum = match[1];
        if (!seenDays.has(dayNum)) {
          dayIndices.push({
            dayNum: dayNum,
            startIndex: match.index,
            matchLength: match[0].length
          });
          seenDays.add(dayNum);
        }
      }
    }
    
    // Sort by day number to ensure correct order
    dayIndices.sort((a, b) => parseInt(a.dayNum) - parseInt(b.dayNum));
    
    // Extract content for each day
    dayIndices.forEach((dayInfo, idx) => {
      const dayNum = dayInfo.dayNum;
      // Start from the position after "Day X"
      let contentStart = text.indexOf(':', dayInfo.startIndex);
      if (contentStart === -1) {
        contentStart = dayInfo.startIndex + dayInfo.matchLength;
      } else {
        contentStart += 1; // Move past the colon
      }
      
      // Find the next "Day X" or use end of text
      let contentEnd = text.length;
      if (idx < dayIndices.length - 1) {
        contentEnd = dayIndices[idx + 1].startIndex;
      }
      
      let rawContent = text.substring(contentStart, contentEnd).trim();
      
      // Clean up the content - remove markdown artifacts and AI garbage
      let content = rawContent
        .replace(/^\s*[:;]\s*/gm, '')                                  // Remove leading colons/semicolons
        .replace(/\*\*(.+?)\*\*/g, '$1')                               // Remove **bold**
        .replace(/\*(.+?)\*/g, '$1')                                   // Remove *italic*
        .replace(/^[-•]\s+/gm, '')                                     // Remove bullet points
        .replace(/^"(.+)"$/gm, '$1')                                   // Remove quotes
        .replace(/^-{3,}$/gm, '')                                      // Remove horizontal rules (---, ----, etc)
        .replace(/^\*{3,}$/gm, '')                                     // Remove *** separators
        .replace(/^\*+$/gm, '')                                        // Remove standalone asterisks
        .replace(/^_+$/gm, '')                                         // Remove underscore separators
        .replace(/^#{1,6}\s+/gm, '')                                   // Remove markdown headings (# ## ### etc)
        .replace(/^Location:\s*[\d\s,]+$/gm, '')                       // Remove "Location: 100, 101, 102..." pattern
        .replace(/^\d{1,3}(?:\s*,\s*\d{1,3})+\s*$/gm, '')             // Remove comma-separated number sequences
        .split('\n')                                                   // Split into lines
        .map(line => line
          .replace(/\*+/g, '')                                         // Remove asterisks
          .replace(/#+/g, '')                                          // Remove hash symbols
          .replace(/^[\d\s,]+$/, '')                                   // Remove lines with only numbers/commas
          .trim()
        )
        .filter(line => line.length > 0)                              // Remove empty lines
        .join('\n')                                                    // Rejoin
        .trim();
      
      // Split content into sections
      const sections = [];
      const lines = content.split('\n');
      
      let currentSection = null;
      lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        
        // Check if it's a section header
        const headerMatch = trimmed.match(/^(morning|afternoon|evening|breakfast|lunch|dinner|activities|recommendations|budget|cost|transportation|tips|highlights|attractions|dining|nightlife|local)[\s:]/i);
        
        if (headerMatch) {
          if (currentSection && currentSection.items.length > 0) {
            sections.push(currentSection);
          }
          const title = trimmed
            .replace(/[:;]\s*$/, '')
            .replace(/\*+/g, '')  // Remove asterisks from title
            .trim();
          currentSection = { 
            title: title.charAt(0).toUpperCase() + title.slice(1),
            items: [] 
          };
        } else {
          if (!currentSection) {
            currentSection = { 
              title: 'Highlights', 
              items: [] 
            };
          }
          // Clean item text: remove markdown, dashes, numbers, etc.
          const cleanedItem = trimmed
            .replace(/\*+/g, '')           // Remove asterisks
            .replace(/#+/g, '')            // Remove hash symbols
            .replace(/^-+\s*/, '')         // Remove leading dashes
            .replace(/\s*-+\s*$/, '')      // Remove trailing dashes
            .trim();
          // Skip lines that are just numbers or special artifacts
          if (cleanedItem && !/^[\d\s,]+$/.test(cleanedItem)) {
            currentSection.items.push(cleanedItem);
          }
        }
      });
      
      // Don't forget the last section
      if (currentSection && currentSection.items.length > 0) {
        sections.push(currentSection);
      }

      days.push({
        number: dayNum,
        sections: sections,
        rawContent: content
      });
    });

    return days;
  };

  const days = parseItinerary(itinerary);

  return (
    <div className="itinerary-container">
      {days.map((day) => (
        <div key={day.number} className="day-card">
          <div className="day-header">
            <h4 className="day-title">Day {day.number}</h4>
          </div>
          <div className="day-content">
            {day.sections && day.sections.length > 0 ? (
              <div className="day-sections">
                {day.sections.map((section, sIdx) => (
                  <div key={sIdx} className="section-block">
                    <h5 className="section-title">{section.title}</h5>
                    <div className="section-items">
                      {section.items.map((item, iIdx) => (
                        <p key={iIdx} className="section-item">{item}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="day-text">
                {day.rawContent.split('\n').map((line, idx) => 
                  line.trim() ? <p key={idx}>{line}</p> : null
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PlannerPage() {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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

    // Calculate duration from start and end date if provided
    let calculatedDuration = Number(duration) || 0;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      calculatedDuration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    const payload = {
      destination: destination.trim(),
      duration: calculatedDuration,
      budget: Number(budget) || 0,
      travelers: Number(travelers) || 1,
      trip_styles: tripStyles,
      start_date: startDate || null,
      end_date: endDate || null,
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
      const dateRange = startDate && endDate ? `from ${startDate} to ${endDate}` : "";
      
      // Generate day list for explicit instruction
      const daysList = Array.from({ length: payload.duration }, (_, i) => `Day ${i + 1}`).join(", ");
      
      const prompt = `You are an expert travel planner. Your task is to create a COMPLETE, DETAILED, and COMPREHENSIVE ${payload.duration}-day itinerary for ${payload.travelers} traveler(s) visiting ${payload.destination} ${dateRange}.

⚠️ CRITICAL REQUIREMENT: You MUST generate a detailed plan for EVERY SINGLE DAY. This is a ${payload.duration}-day trip, so you MUST provide content for ALL of these days: ${daysList}

⚠️ NO SHORTCUTS: Do not generate fewer days than ${payload.duration}. Every day listed above must have detailed content.

Trip Details:
- Destination: ${payload.destination}
- Number of Days: ${payload.duration}
- Total Budget: ₹${payload.budget}
- Number of Travelers: ${payload.travelers}
- Travel Style: ${payload.trip_styles.join(", ") || "General sightseeing"}

For EACH day (and there are ${payload.duration} days total), provide:
- Morning activities and attractions (with specific times and locations)
- Breakfast and lunch recommendations (with estimated costs)
- Afternoon activities and sightseeing (specific places to visit)
- Evening activities and dinner recommendations
- Daily estimated costs
- Local transportation tips
- Helpful local insights

FORMAT INSTRUCTIONS (FOLLOW EXACTLY):
- Start each day with "Day 1:", "Day 2:", "Day 3:", etc.
- Make each day section clearly separated
- Include all ${payload.duration} days - no exceptions
- Provide 4-6 detailed activities per day minimum
- Include estimated costs for each activity

Example format for multi-day trip:
Day 1:
Morning: [activity details]
Afternoon: [activity details]
Evening: [activity details]

Day 2:
Morning: [activity details]
...and so on for ALL ${payload.duration} days.

FINAL CHECK: Before you finish, verify you have provided content for Day 1 through Day ${payload.duration}. Do not submit incomplete itineraries.`;

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
                  <span className="label">Budget (INR)</span>
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

            <div className="planner-grid2">
              <label className="planner-field">
                <div className="field-head">
                  <span className="ico">
                    <FiCalendar />
                  </span>
                  <span className="label">Start Date</span>
                </div>
                <input
                  type="date"
                  placeholder="dd----yyyy"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </label>
              <label className="planner-field">
                <div className="field-head">
                  <span className="ico">
                    <FiCalendar />
                  </span>
                  <span className="label">End Date</span>
                </div>
                <input
                  type="date"
                  placeholder="dd----yyyy"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
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

          </section>

          {itinerary && (
            <section className="planner-result-card">
              <h3>Your AI Itinerary</h3>
              <ItineraryDisplay itinerary={itinerary} />
            </section>
          )}

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
