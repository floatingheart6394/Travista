import NewNavbar from "../components/NewNavbar";

export default function GamePage() {
  const containerStyle = {
    margin: "0",
    padding: "0",
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
    backgroundColor: "#000",
    display: "flex",
    flexDirection: "column",
  };

  const iframeStyle = {
    width: "100%",
    height: "100%",
    border: "none",
    display: "block",
    flex: "1",
  };

  return (
    <div style={containerStyle}>
      <NewNavbar />
      <iframe
        src="/game/pokemon-style-game/index.html"
        style={iframeStyle}
        title="Pixel Adventure Game"
        allowFullScreen
      />
    </div>
  );
}
