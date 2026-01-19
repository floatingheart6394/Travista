import NewNavbar from "../components/NewNavbar";

export default function ExplorePage() {
  return (
    <div className="dashboard-page">
      <NewNavbar />
      <main className="dashboard-content">
        <div className="explore-section">
          <h1>Explore Destinations</h1>
          <p>Discover amazing travel destinations and inspirations.</p>
          {/* Add destination cards and exploration features here */}
        </div>
      </main>
    </div>
  );
}
