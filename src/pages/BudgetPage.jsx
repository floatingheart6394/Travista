import { useMemo, useState, useEffect, useRef } from "react";
import NewNavbar from "../components/NewNavbar";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
} from "chart.js";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { scanReceipt, addExpense as addExpenseAPI } from "../services/budgetService";
import "../styles/BudgetPage.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement
);

const API_URL = import.meta.env.VITE_API_BASE_URL;
const CATEGORIES = [
  { key: "food", label: "Food & Dining", emoji: "🍽️", color: "#FF6B6B" },
  { key: "stay", label: "Accommodation", emoji: "🏨", color: "#4ECDC4" },
  { key: "transport", label: "Transport", emoji: "🚗", color: "#45B7D1" },
  { key: "shopping", label: "Shopping", emoji: "🛍️", color: "#F7DC6F" },
  { key: "activities", label: "Activities", emoji: "🎉", color: "#BB8FCE" },
  { key: "misc", label: "Miscellaneous", emoji: "📦", color: "#85C1E2" },
];

export default function BudgetPage() {
  // State Management
  const [tripBudget, setTripBudget] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [activeTripId, setActiveTripId] = useState(null);
  const [tripDestination, setTripDestination] = useState("");
  const [activeTab, setActiveTab] = useState("expenses");

  // Receipt Scanning State
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanConfidence, setScanConfidence] = useState(0);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [scanMessage, setScanMessage] = useState("");

  // Manual Expense State
  const [manualExpense, setManualExpense] = useState({
    place: "",
    amount: "",
    category: "food",
    date: new Date().toISOString().slice(0, 10),
  });

  // UI State
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationError, setValidationError] = useState("");
  const fileInputRef = useRef(null);

  // Load trip data on mount
  useEffect(() => {
    loadBudgetData();
  }, []);

  async function loadBudgetData() {
    try {
      const token = localStorage.getItem("access_token");
      const tripRes = await fetch(`${API_URL}/trip/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!tripRes.ok) return;
      const trip = await tripRes.json();
      setActiveTripId(trip.id);
      setTripBudget(trip.budget ?? 0);
      setTripDestination(trip.destination ?? "");
      const start = new Date();
      const end = new Date(Date.now() + (trip.duration || 1) * 24 * 60 * 60 * 1000);
      setStartDate(start);
      setEndDate(end);
      await fetchExpenses(trip.id);
    } catch (err) {
      console.error("Failed to load budget data:", err);
    }
  }

  async function fetchExpenses(tripId) {
    if (!tripId) return;
    try {
      const res = await fetch(`${API_URL}/budget/expenses/?trip_id=${tripId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      setExpenses(data.map((e) => ({ ...e, date: new Date(e.date) })));
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
    }
  }

  // Receipt Scanning Handler
  async function handleReceiptScan(file) {
    if (!file) {
      setValidationError("Please select a file");
      setShowValidationModal(true);
      return;
    }

    if (!activeTripId) {
      setValidationError("No active trip. Please create a trip first.");
      setShowValidationModal(true);
      return;
    }

    setIsScanning(true);
    setScanMessage("📸 Scanning receipt...");

    try {
      const result = await scanReceipt(file);

      if (result.status === "error") {
        setScanMessage(`❌ ${result.error}`);
        setIsScanning(false);
        return;
      }

      // Extract data from OCR result
      extractExpenseDataFromReceipt(result);
      setReceiptFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setReceiptPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      setScanMessage("✅ Receipt scanned successfully!");
      setShowReceiptModal(true);
    } catch (err) {
      setScanMessage(`❌ Scan failed: ${err.message}`);
    } finally {
      setIsScanning(false);
    }
  }

  // Extract expense data from OCR result
  function extractExpenseDataFromReceipt(ocrResult) {
    setOcrResult(ocrResult);

    // Extract amount
    const text = ocrResult.text || "";
    const amountMatch = text.match(/\$?\s?(\d+[.,]\d{2})/);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/, "")) : "";

    // Detect category
    let detectedCategory = "food";
    const lowerText = text.toLowerCase();

    if (lowerText.includes("hotel") || lowerText.includes("room") || lowerText.includes("resort")) {
      detectedCategory = "stay";
    } else if (lowerText.includes("gas") || lowerText.includes("uber") || lowerText.includes("taxi")) {
      detectedCategory = "transport";
    } else if (lowerText.includes("restaurant") || lowerText.includes("cafe") || lowerText.includes("food")) {
      detectedCategory = "food";
    } else if (lowerText.includes("mall") || lowerText.includes("shop") || lowerText.includes("store")) {
      detectedCategory = "shopping";
    }

    // Extract vendor
    const vendorMatch = text.match(/^([A-Za-z\s]{3,30})/);
    const place = vendorMatch ? vendorMatch[1].trim().substring(0, 30) : "Receipt Item";

    setManualExpense({
      place,
      amount: amount.toString(),
      category: detectedCategory,
      date: new Date().toISOString().slice(0, 10),
    });

    setScanConfidence(ocrResult.confidence || 0);
  }

  // Add expense
  async function addExpense() {
    if (!manualExpense.place || !manualExpense.amount) {
      setValidationError("Please fill in all fields");
      setShowValidationModal(true);
      return;
    }

    try {
      const result = await addExpenseAPI({
        place: manualExpense.place,
        amount: parseFloat(manualExpense.amount),
        category: manualExpense.category,
        date: manualExpense.date,
        trip_id: activeTripId,
      });

      if (result.status === "error") {
        setValidationError(result.error);
        setShowValidationModal(true);
        return;
      }

      setShowReceiptModal(false);
      setManualExpense({
        place: "",
        amount: "",
        category: "food",
        date: new Date().toISOString().slice(0, 10),
      });
      setScanMessage("✅ Expense added successfully!");
      setTimeout(() => setScanMessage(""), 3000);
      await fetchExpenses(activeTripId);
    } catch (err) {
      setValidationError(err.message);
      setShowValidationModal(true);
    }
  }

  // Submit manual expense
  function submitManualExpense() {
    if (!manualExpense.place || !manualExpense.amount) {
      setValidationError("Please fill in all fields");
      setShowValidationModal(true);
      return;
    }
    addExpense();
  }

  // Delete expense
  async function deleteExpense(id) {
    try {
      const res = await fetch(`${API_URL}/budget/expenses/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchExpenses(activeTripId);
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  }

  // Calculate metrics
  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  }, [expenses]);

  const budgetPct = useMemo(
    () => (tripBudget ? Math.round((totalSpent / tripBudget) * 100) : 0),
    [tripBudget, totalSpent]
  );

  const daysLeft = useMemo(() => {
    if (!endDate) return 0;
    return Math.max(0, Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24)));
  }, [endDate]);

  const expensesByCategory = useMemo(() => {
    const breakdown = {};
    CATEGORIES.forEach((cat) => (breakdown[cat.key] = 0));
    expenses.forEach((exp) => {
      breakdown[exp.category] = (breakdown[exp.category] || 0) + parseFloat(exp.amount);
    });
    return breakdown;
  }, [expenses]);

  const doughnutData = {
    labels: CATEGORIES.map((c) => c.label),
    datasets: [
      {
        data: CATEGORIES.map((c) => expensesByCategory[c.key]),
        backgroundColor: CATEGORIES.map((c) => c.color),
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  // Render main UI
  return (
    <div className="dashboard-page">
      <NewNavbar />
      <main className="smart-budget">
        {/* Hero Section */}
        <section className="budget-hero">
          <h1>
            Budget Tracker <span>💰</span>
          </h1>
          <p>Smart expense management for your {tripDestination || "trip"} trip</p>
        </section>

        {/* Metric Cards */}
        <section className="metric-cards">
          <div className="metric-card metric--brand">
            <h4>Total Budget</h4>
            <div className="metric-amount">${tripBudget.toLocaleString()}</div>
            <div className="metric-sub">{tripDestination ? `${tripDestination} Getaway` : "Your Trip"}</div>
          </div>
          <div className="metric-card">
            <h4>Amount Spent</h4>
            <div className="metric-amount red">${totalSpent.toFixed(2)}</div>
            <div className="metric-sub">{budgetPct}% of budget</div>
          </div>
          <div className="metric-card">
            <h4>Days Left</h4>
            <div className="metric-amount">{daysLeft}</div>
            <div className="metric-sub">Days remaining</div>
          </div>
          <div className="metric-card">
            <h4>Remaining Budget</h4>
            <div className="metric-amount">${(tripBudget - totalSpent).toFixed(2)}</div>
            <div className="metric-sub">${(daysLeft > 0 ? ((tripBudget - totalSpent) / daysLeft).toFixed(2) : 0)}/day</div>
          </div>
        </section>

        {/* Budget Progress */}
        <section className="budget-progress">
          <div className="progress-label">
            <span>Budget Used</span>
            <span className="progress-percent">{budgetPct}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${Math.min(budgetPct, 100)}%` }} />
          </div>
        </section>

        {/* Tabs */}
        <div className="budget-tabs">
          <button
            className={`tab-button ${activeTab === "expenses" ? "active" : ""}`}
            onClick={() => setActiveTab("expenses")}
          >
            📋 Expenses
          </button>
          <button
            className={`tab-button ${activeTab === "scan" ? "active" : ""}`}
            onClick={() => setActiveTab("scan")}
          >
            📸 Scan Receipt
          </button>
          <button
            className={`tab-button ${activeTab === "add" ? "active" : ""}`}
            onClick={() => setActiveTab("add")}
          >
            ➕ Add Manually
          </button>
          <button
            className={`tab-button ${activeTab === "charts" ? "active" : ""}`}
            onClick={() => setActiveTab("charts")}
          >
            📊 Analytics
          </button>
        </div>

        {/* Expenses Tab */}
        {activeTab === "expenses" && (
          <section className="expense-list-section">
            <h3>📋 All Expenses ({expenses.length})</h3>
            <div className="expense-list">
              {expenses.length === 0 ? (
                <p className="empty-message">No expenses yet. Start by scanning a receipt or adding manually!</p>
              ) : (
                expenses.map((e) => {
                  const cat = CATEGORIES.find((c) => c.key === e.category);
                  return (
                    <div key={e.id} className="expense-item">
                      <div className="expense-info">
                        <span style={{ fontSize: "20px", minWidth: "30px" }}>{cat?.emoji}</span>
                        <div>
                          <strong>{e.place}</strong>
                          <br />
                          <span className="category-badge">{cat?.label}</span>
                        </div>
                      </div>
                      <div className="expense-amount">${parseFloat(e.amount).toFixed(2)}</div>
                      <button className="btn-delete" onClick={() => deleteExpense(e.id)}>
                        Delete
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* Scan Receipt Tab */}
        {activeTab === "scan" && (
          <section className="receipt-scanner">
            <h3>📸 Scan Receipt</h3>
            <p>Upload a receipt photo to automatically extract expense information</p>
            <div className="scanner-upload">
              <div className="file-input-wrapper">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleReceiptScan(file);
                  }}
                />
                <button
                  className={`upload-button ${isScanning ? "disabled" : ""}`}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isScanning}
                >
                  📤 {isScanning ? "Scanning..." : "Choose Receipt Image"}
                </button>
              </div>
            </div>
            {scanMessage && (
              <div
                className={`scanner-status ${
                  scanMessage.includes("✅")
                    ? "success"
                    : scanMessage.includes("❌")
                    ? "error"
                    : "loading"
                }`}
              >
                {scanMessage}
              </div>
            )}
          </section>
        )}

        {/* Add Manually Tab */}
        {activeTab === "add" && (
          <section className="add-expense-section">
            <h3>➕ Add Expense Manually</h3>
            <div className="expense-form">
              <input
                type="text"
                placeholder="Where did you spend? (e.g., Coffee Shop, Hotel)"
                value={manualExpense.place}
                onChange={(e) => setManualExpense({ ...manualExpense, place: e.target.value })}
              />
              <input
                type="number"
                placeholder="Amount (0.00)"
                value={manualExpense.amount}
                onChange={(e) => setManualExpense({ ...manualExpense, amount: e.target.value })}
                step="0.01"
                min="0"
              />
              <input
                type="date"
                value={manualExpense.date}
                onChange={(e) => setManualExpense({ ...manualExpense, date: e.target.value })}
              />
            </div>

            <div className="category-grid">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  className={`category-btn ${manualExpense.category === cat.key ? "active" : ""}`}
                  onClick={() => setManualExpense({ ...manualExpense, category: cat.key })}
                >
                  <span className="cat-emoji">{cat.emoji}</span>
                  <span className="cat-label">{cat.label}</span>
                </button>
              ))}
            </div>

            <button className="btn-primary" onClick={submitManualExpense}>
              Add Expense
            </button>
          </section>
        )}

        {/* Charts Tab */}
        {activeTab === "charts" && (
          <section className="charts-section">
            <h3>📊 Spending by Category</h3>
            <div className="chart-container">
              <div className="chart-wrapper">
                {expenses.length > 0 ? (
                  <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: true }} />
                ) : (
                  <p className="no-chart-data">No expense data to display yet</p>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Receipt Confirmation Modal */}
      {showReceiptModal && (
        <div className="modal-overlay" onClick={() => setShowReceiptModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Scanned Expense</h3>
              <button className="modal-close" onClick={() => setShowReceiptModal(false)}>
                ✕
              </button>
            </div>

            {receiptPreview && (
              <img src={receiptPreview} alt="Receipt" className="receipt-preview" />
            )}

            <div className="scanned-data">
              <div className="data-row">
                <label>Vendor/Place:</label>
                <input
                  type="text"
                  value={manualExpense.place}
                  onChange={(e) => setManualExpense({ ...manualExpense, place: e.target.value })}
                />
              </div>
              <div className="data-row">
                <label>Amount:</label>
                <input
                  type="number"
                  value={manualExpense.amount}
                  onChange={(e) => setManualExpense({ ...manualExpense, amount: e.target.value })}
                  step="0.01"
                />
              </div>
              <div className="data-row">
                <label>Category:</label>
                <select
                  value={manualExpense.category}
                  onChange={(e) => setManualExpense({ ...manualExpense, category: e.target.value })}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.emoji} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="data-row">
                <label>Date:</label>
                <input
                  type="date"
                  value={manualExpense.date}
                  onChange={(e) => setManualExpense({ ...manualExpense, date: e.target.value })}
                />
              </div>
              {scanConfidence > 0 && (
                <div className="confidence-indicator">
                  Confidence:
                  <span
                    className={`confidence-badge ${
                      scanConfidence >= 80 ? "high" : scanConfidence >= 60 ? "medium" : "low"
                    }`}
                  >
                    {scanConfidence}%
                  </span>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-confirm" onClick={addExpense}>
                ✓ Confirm & Save
              </button>
              <button className="btn-cancel" onClick={() => setShowReceiptModal(false)}>
                ✕ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Modal */}
      {showValidationModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>⚠️ Error</h3>
              <button className="modal-close" onClick={() => setShowValidationModal(false)}>
                ✕
              </button>
            </div>
            <p style={{ color: "#333", fontSize: "16px" }}>{validationError}</p>
            <div className="modal-actions">
              <button className="btn-confirm" onClick={() => setShowValidationModal(false)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
