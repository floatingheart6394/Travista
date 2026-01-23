import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiCalendar,
  FiDollarSign,
  FiMapPin,
  FiCheckCircle,
  FiCircle,
  FiStar,
} from "react-icons/fi";
import NewNavbar from "../components/NewNavbar";
import "../styles/PastTripsPage.css";

function PastTripsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState("menu"); // 'menu', 'trips', 'expenses', 'todos'
  const [trips, setTrips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [todos, setTodos] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  // Fetch past trips with itineraries
  const fetchPastTrips = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Authentication token not found");
      const response = await fetch(`${API_BASE}/trip/past/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(`Failed to fetch trips (${response.status}): ${error.detail || response.statusText}`);
      }
      const data = await response.json();
      setTrips(data);
      setView("trips");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all expenses
  const fetchAllExpenses = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Authentication token not found");
      const response = await fetch(`${API_BASE}/budget/all-expenses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(`Failed to fetch expenses (${response.status}): ${error.detail || response.statusText}`);
      }
      const data = await response.json();
      setExpenses(data);
      setView("expenses");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all todos
  const fetchAllTodos = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Authentication token not found");
      const response = await fetch(`${API_BASE}/todos/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(`Failed to fetch todos (${response.status}): ${error.detail || response.statusText}`);
      }
      const data = await response.json();
      const normalized = data.map((todo) => ({
        id: todo.id,
        title: todo.title,
        description: todo.description,
        completed: todo.is_done ?? todo.completed ?? false,
        important: todo.is_important ?? todo.important ?? false,
        category: todo.category,
        priority: todo.priority,
        due_at: todo.due_at,
      }));
      setTodos(normalized);
      setView("todos");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Menu View
  if (view === "menu") {
    return (
      <div className="past-trips-container">
        <NewNavbar />
        <div className="past-trips-content">
          <div className="past-trips-header">
            <button
              className="back-btn"
              onClick={() => navigate("/profile")}
              title="Back to Profile"
            >
              <FiArrowLeft size={24} />
            </button>
            <h1>Past Trip Records</h1>
          </div>

          <div className="menu-grid">
            <button
              className="menu-card trip-card"
              onClick={fetchPastTrips}
              disabled={loading}
            >
              <FiMapPin size={40} />
              <h3>Trip & Itinerary</h3>
              <p>View all your trips with generated itineraries</p>
            </button>

            <button
              className="menu-card expense-card"
              onClick={fetchAllExpenses}
              disabled={loading}
            >
              <FiDollarSign size={40} />
              <h3>Expenses</h3>
              <p>All expenses tracked across all trips</p>
            </button>

            <button
              className="menu-card todo-card"
              onClick={fetchAllTodos}
              disabled={loading}
            >
              <FiCheckCircle size={40} />
              <h3>Todo Tasks</h3>
              <p>All tasks with completion and priority status</p>
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    );
  }

  // Trip & Itinerary View
  if (view === "trips") {
    return (
      <div className="past-trips-container">
        <NewNavbar />
        <div className="past-trips-content">
          <div className="past-trips-header">
            <button
              className="back-btn"
              onClick={() => setView("menu")}
              title="Back to Menu"
            >
              <FiArrowLeft size={24} />
            </button>
            <h1>Trip & Itinerary Records</h1>
          </div>

          {loading ? (
            <div className="loading">Loading trips...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : trips.length === 0 ? (
            <div className="empty-state">No trips found</div>
          ) : (
            <div className="trips-list">
              {trips.map((trip) => (
                <div key={trip.id} className="trip-record-card">
                  <div className="trip-header">
                    <div className="trip-basic-info">
                      <h3>{trip.destination}</h3>
                      <p className="trip-id">Trip ID: {trip.id}</p>
                    </div>
                    <div className="trip-dates">
                      <FiCalendar size={18} />
                      <span>
                        {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                      </span>
                    </div>
                  </div>

                  <div className="trip-details">
                    <div className="detail-item">
                      <span className="label">Duration:</span>
                      <span>{trip.duration} days</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Travelers:</span>
                      <span>{trip.travelers}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Budget:</span>
                      <span>₹{parseFloat(trip.budget || 0).toLocaleString()}</span>
                    </div>
                    {trip.trip_styles?.length > 0 && (
                      <div className="detail-item">
                        <span className="label">Styles:</span>
                        <span>{trip.trip_styles.join(", ")}</span>
                      </div>
                    )}
                  </div>

                  {trip.itinerary && (
                    <div className="itinerary-section">
                      <h4>Generated Itinerary</h4>
                      <div className="itinerary-content">
                        {trip.itinerary}
                      </div>
                    </div>
                  )}

                  {!trip.itinerary && (
                    <div className="no-itinerary">
                      No itinerary generated for this trip
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Expenses View
  if (view === "expenses") {
    return (
      <div className="past-trips-container">
        <NewNavbar />
        <div className="past-trips-content">
          <div className="past-trips-header">
            <button
              className="back-btn"
              onClick={() => setView("menu")}
              title="Back to Menu"
            >
              <FiArrowLeft size={24} />
            </button>
            <h1>All Expenses</h1>
          </div>

          {loading ? (
            <div className="loading">Loading expenses...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : expenses.length === 0 ? (
            <div className="empty-state">No expenses found</div>
          ) : (
            <div className="expenses-list">
              {expenses.map((expense) => (
                <div key={expense.id} className="expense-record-card">
                  <div className="expense-header">
                    <div className="expense-basic-info">
                      <h4>{expense.place}</h4>
                      <p className="expense-id">Expense ID: {expense.id}</p>
                    </div>
                    <div className="expense-amount">
                      ₹{parseFloat(expense.amount).toLocaleString()}
                    </div>
                  </div>

                  <div className="expense-details">
                    <div className="detail-item">
                      <span className="label">Trip ID:</span>
                      <span className="trip-id-badge">{expense.trip_id}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Category:</span>
                      <span className="category-badge">{expense.category}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Date:</span>
                      <span>{formatDate(expense.date)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Source:</span>
                      <span>{expense.source}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Todos View
  if (view === "todos") {
    return (
      <div className="past-trips-container">
        <NewNavbar />
        <div className="past-trips-content">
          <div className="past-trips-header">
            <button
              className="back-btn"
              onClick={() => setView("menu")}
              title="Back to Menu"
            >
              <FiArrowLeft size={24} />
            </button>
            <h1>All Todo Tasks</h1>
          </div>

          {loading ? (
            <div className="loading">Loading todos...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : todos.length === 0 ? (
            <div className="empty-state">No todos found</div>
          ) : (
            <div className="todos-list">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`todo-record-card ${
                    todo.completed ? "completed" : ""
                  }`}
                >
                  <div className="todo-status">
                    {todo.completed ? (
                      <FiCheckCircle size={20} className="completed-icon" />
                    ) : (
                      <FiCircle size={20} className="pending-icon" />
                    )}
                  </div>

                  <div className="todo-content">
                    <h4
                      className={`todo-title ${
                        todo.completed ? "completed-text" : ""
                      }`}
                    >
                      {todo.title}
                    </h4>
                    {todo.description && (
                      <p className="todo-description">{todo.description}</p>
                    )}
                  </div>

                  <div className="todo-meta">
                      {todo.important && (
                        <span className="important-badge">
                          <FiStar size={16} /> Important
                        </span>
                      )}
                      {todo.category && (
                        <span className="category-badge">{todo.category}</span>
                      )}
                      {todo.priority && (
                        <span className="status-badge">Priority: {todo.priority}</span>
                      )}
                      {todo.due_at && (
                        <span className="status-badge">Due: {formatDate(todo.due_at)}</span>
                      )}
                      <span className="status-badge">
                        {todo.completed ? "✓ Completed" : "Pending"}
                      </span>
                    </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default PastTripsPage;
