import NewNavbar from "../components/NewNavbar";

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      <NewNavbar />
      <main className="dashboard-content" aria-label="Main content area" />
    </div>
  );
}
