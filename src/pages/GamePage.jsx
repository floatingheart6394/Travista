import NewNavbar from "../components/NewNavbar";

export default function GamePage() {
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#1a1a1a",
    padding: "20px",
  };

  const headingStyle = {
    color: "#fff",
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "30px",
  };

  const iframeStyle = {
    width: "1024px",
    height: "576px",
    border: "none",
    borderRadius: "8px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
  };

  return (
    <div className="dashboard-page">
      <NewNavbar />
      <main style={containerStyle}>
        <h1 style={headingStyle}>Pixel Adventure Game</h1>
        <iframe
          src="/game/pokemon-style-game/index.html"
          style={iframeStyle}
          title="Pixel Adventure Game"
          allowFullScreen
        />
      </main>
    </div>
  );
}
