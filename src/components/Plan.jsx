import PI from "../assets/PI.png";
import TDL from "../assets/TDL.png";

export default function Plan() {
  return (
    <section className="plan" id="plan">
      <h2>Plan Your Trip</h2>

      <div className="plan-grid">
        <div className="plan-media">
          <img className="plan-img" src={PI} alt="Personalized Itinerary Planner" />
        </div>
        <div className="plan-card plan-card--white">
          <h3>Personalized Itinerary Planner</h3>
          <p>
            Travista builds a complete trip plan from your budget, time,
            preferences, and travel group, giving you multiple smart itineraries
            to choose from.
          </p>
        </div>

        <div className="plan-media">
          <img className="plan-img" src={TDL} alt="Custom To-Do List" />
        </div>
        <div className="plan-card plan-card--white">
          <h3>Custom To-Do List</h3>
          <p>
            Add your own tasks, reminders, and must-do activities. Travista
            keeps everything organized so you stay on track throughout your
            journey.
          </p>
        </div>
      </div>
    </section>
  );
}
