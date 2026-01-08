import { Link } from "react-router-dom";

export default function Emergency() {
  return (
    <section className="emergency">
      <h2>
        <Link to="/emergency" style={{ textDecoration: 'none', color: 'inherit' }}>
          Nearby Emergency Finder
        </Link>
      </h2>
      <p>
        Instantly finds nearby hospitals, pharmacies, ATMs, and restrooms using GPS and AI.
      </p>
    </section>
  );
}
