import { FiMap, FiMapPin } from "react-icons/fi";
import { FaUtensils } from "react-icons/fa";

export default function Explore() {
  return (
    <section className="explore" id="explore">
      <h2>Explore Smarter with Travista</h2>
      <div className="cards">
        <div className="card">
          <div className="card-icon" aria-hidden="true">
            <FiMap />
          </div>
          <h3>Smart Route Planning</h3>
          <p>
            Travista's AI evaluates distance, traffic, scenery, crowd levels, and
            cost to recommend the most efficient, scenic, or budget-friendly
            routes, so every journey fits your travel style.
          </p>
        </div>

        <div className="card">
          <div className="card-icon" aria-hidden="true">
            <FiMapPin />
          </div>
          <h3>Hidden Gems Discovery</h3>
          <p>
            Discover cafés, viewpoints, streets, and cultural spots that never
            appear in typical travel apps. Travista reveals unique places
            travelers usually miss, giving you a more meaningful experience.
          </p>
        </div>

        <div className="card">
          <div className="card-icon" aria-hidden="true">
            <FaUtensils />
          </div>
          <h3>Food and Stay Picks</h3>
          <p>
            Get carefully curated restaurant and accommodation recommendations
            based on your taste, budget, hygiene ratings, and real traveler
            feedback, ensuring comfort, quality, and value wherever you go.
          </p>
        </div>
      </div>
    </section>
  );
}

