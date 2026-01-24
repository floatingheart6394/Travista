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
  { key: "food", label: "Food & Dining", emoji: "🍽️", color: "#E60000" },
  { key: "stay", label: "Accommodation", emoji: "🏨", color: "#0099CC" },
  { key: "transport", label: "Transport", emoji: "🚗", color: "#0066CC" },
  { key: "shopping", label: "Shopping", emoji: "🛍️", color: "#009999" },
  { key: "activities", label: "Activities", emoji: "🎉", color: "#CC00CC" },
  { key: "misc", label: "Miscellaneous", emoji: "📦", color: "#00AA44" },
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
    source: "manual",
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
      
      // Use explicit start_date and end_date from trip if available
      let start, end;
      if (trip.start_date && trip.end_date) {
        start = new Date(trip.start_date + "T00:00:00Z");
        end = new Date(trip.end_date + "T00:00:00Z");
      } else {
        // Fallback to calculating from duration
        const startDate = new Date();
        const startDateKey = startDate.toISOString().split("T")[0];
        start = new Date(startDateKey + "T00:00:00Z");
        end = new Date(start.getTime() + ((trip.duration || 1) - 1) * 24 * 60 * 60 * 1000);
      }
      setStartDate(start);
      setEndDate(end);

      // #region agent log
      fetch("http://127.0.0.1:7242/ingest/f67b22ff-b9f1-49eb-90ce-af684507f178", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "debug-session",
          runId: "pre-fix",
          hypothesisId: "H1",
          location: "BudgetPage.jsx:loadBudgetData",
          message: "Loaded active trip and computed start/end dates",
          data: {
            tripId: trip.id,
            apiStartDate: trip.start_date || null,
            apiEndDate: trip.end_date || null,
            duration: trip.duration,
            computedStart: start.toISOString(),
            computedEnd: end.toISOString(),
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

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
      // Keep `date` as a date-only string from API when possible to avoid timezone shifts.
      setExpenses(
        data.map((e) => ({
          ...e,
          date: typeof e.date === "string" ? e.date : new Date(e.date).toISOString().slice(0, 10),
        }))
      );
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
    }
  }

  function toUtcMidnightMs(value) {
    if (!value) return null;
    if (typeof value === "string") {
      const s = value.slice(0, 10); // YYYY-MM-DD
      const [y, m, d] = s.split("-").map((n) => parseInt(n, 10));
      if (!y || !m || !d) return null;
      return Date.UTC(y, m - 1, d);
    }
    if (value instanceof Date) {
      return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
    }
    return null;
  }

  function computeTripDayNumber(expenseDate, tripStartDate) {
    const expMs = toUtcMidnightMs(expenseDate);
    const startMs = toUtcMidnightMs(tripStartDate);
    if (expMs == null || startMs == null) return null;
    return Math.floor((expMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
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
    console.log("OCR Result received:", ocrResult);
    setOcrResult(ocrResult);

    // Use the structured data returned from the backend API
    // The backend already extracts vendor, amount, and category with high accuracy
    const vendor = ocrResult.vendor || "Receipt Item";
    const amount = ocrResult.amount || "";
    const category = ocrResult.category || "food";
    const confidence = ocrResult.amount_confidence || 0;
    const detectedDate = ocrResult.detected_date;

    console.log("Extracted data:", { vendor, amount, category, confidence, detectedDate });
    console.log("Date from OCR:", detectedDate);
    console.log("Using fallback date:", !detectedDate);
    
    // Show warning if date was not detected
    if (!detectedDate && amount) {
      console.warn("⚠️ Date not detected from receipt");
    }

    // Map backend categories to frontend category keys
    const categoryMapping = {
      "food": "food",
      "stay": "stay",
      "transport": "transport",
      "shopping": "shopping",
      "activities": "activities",
      "misc": "misc"
    };

    const mappedCategory = categoryMapping[category] || "misc";

    // Use detected date if provided, otherwise fall back to today's date
    const expenseDate = detectedDate || new Date().toISOString().slice(0, 10);

    setManualExpense({
      place: vendor,
      amount: amount ? amount.toString() : "",
      category: mappedCategory,
      date: expenseDate,
      source: "ocr",
    });

    setScanConfidence(confidence);
  }

  // Add expense
  async function addExpense() {
    if (!manualExpense.place || !manualExpense.amount) {
      setValidationError("Please fill in all fields");
      setShowValidationModal(true);
      return;
    }

    try {
      // #region agent log
      fetch("http://127.0.0.1:7242/ingest/f67b22ff-b9f1-49eb-90ce-af684507f178", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "debug-session",
          runId: "amount-issue",
          hypothesisId: "A1",
          location: "BudgetPage.jsx:addExpense",
          message: "Submitting expense payload",
          data: {
            place: manualExpense.place,
            rawAmount: manualExpense.amount,
            parsedAmount: parseFloat(manualExpense.amount),
            category: manualExpense.category,
            date: manualExpense.date,
            tripId: activeTripId,
            source: manualExpense.source || "manual",
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      const result = await addExpenseAPI({
        place: manualExpense.place,
        amount: parseFloat(manualExpense.amount),
        category: manualExpense.category,
        date: manualExpense.date,
        trip_id: activeTripId,
        source: manualExpense.source || "manual",
      });

      if (result.status === "error") {
        setValidationError(result.error);
        setShowValidationModal(true);
        return;
      }

      // #region agent log
      fetch("http://127.0.0.1:7242/ingest/f67b22ff-b9f1-49eb-90ce-af684507f178", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "debug-session",
          runId: "amount-issue",
          hypothesisId: "A2",
          location: "BudgetPage.jsx:addExpense",
          message: "Expense API response",
          data: {
            responseStatus: result.status,
            responseAmount: result.data?.amount,
            responseId: result.data?.id,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      setShowReceiptModal(false);
      setManualExpense({
        place: "",
        amount: "",
        category: "food",
        date: new Date().toISOString().slice(0, 10),
        source: "manual",
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
    if (!startDate || !endDate) return 0;
    const nowMs = toUtcMidnightMs(new Date());
    const endMs = toUtcMidnightMs(endDate);
    const startMs = toUtcMidnightMs(startDate);
    if (nowMs == null || endMs == null || startMs == null) return 0;
    const dayMs = 1000 * 60 * 60 * 24;
    const totalDuration = Math.floor((endMs - startMs) / dayMs) + 1;

    let computed = 0;
    if (nowMs < startMs) {
      // Before trip starts: show full duration (what the user expects)
      computed = Math.max(totalDuration, 0);
    } else if (nowMs <= endMs) {
      // During trip: inclusive countdown
      computed = Math.floor((endMs - nowMs) / dayMs) + 1;
    } else {
      computed = 0;
    }

    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/f67b22ff-b9f1-49eb-90ce-af684507f178", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "days-left",
        hypothesisId: "D1",
        location: "BudgetPage.jsx:daysLeft",
        message: "Computed days left",
        data: {
          startDate: new Date(startMs).toISOString(),
          endDate: new Date(endMs).toISOString(),
          today: new Date(nowMs).toISOString(),
          totalDuration,
          computed,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    return computed;
  }, [startDate, endDate]);

  const expensesByCategory = useMemo(() => {
    const breakdown = {};
    CATEGORIES.forEach((cat) => (breakdown[cat.key] = 0));
    expenses.forEach((exp) => {
      breakdown[exp.category] = (breakdown[exp.category] || 0) + parseFloat(exp.amount);
    });
    return breakdown;
  }, [expenses]);

  const doughnutData = {
    labels: CATEGORIES.map((c) => {
      const amount = expensesByCategory[c.key];
      return `${c.label}: ₹${amount.toFixed(2)}`;
    }),
    datasets: [
      {
        data: CATEGORIES.map((c) => expensesByCategory[c.key]),
        backgroundColor: CATEGORIES.map((c) => c.color),
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "right",
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
          generateLabels: function(chart) {
            const data = chart.data;
            return data.labels.map((label, i) => ({
              text: label,
              fillStyle: data.datasets[0].backgroundColor[i],
              hidden: false,
              index: i,
            }));
          },
        },
        maxWidth: 150,
      },
    },
  };

  // Daily spending data for line chart
  const dailySpendingData = useMemo(() => {
    if (!startDate || !endDate) return null;

    const normalizedStartDateMs = toUtcMidnightMs(startDate);
    const tripEndDateMs = toUtcMidnightMs(endDate);
    if (normalizedStartDateMs == null || tripEndDateMs == null) return null;

    // Group expenses by day
    const dailyMap = {};
    expenses.forEach((exp) => {
      const dayNum = computeTripDayNumber(exp.date, startDate);
      const dateKey = typeof exp.date === "string" ? exp.date.slice(0, 10) : new Date(exp.date).toISOString().slice(0, 10);
      if (dayNum > 0) {
        dailyMap[dateKey] = (dailyMap[dateKey] || 0) + parseFloat(exp.amount);
      }
    });

    // Generate array of all days from start date to end date
    const days = [];
    const dayMs = 1000 * 60 * 60 * 24;

    let dayCount = 0;
    for (let currentMs = normalizedStartDateMs; currentMs <= tripEndDateMs; currentMs += dayMs) {
      dayCount++;
      const dateKey = new Date(currentMs).toISOString().split("T")[0];
      days.push({
        date: dateKey,
        amount: dailyMap[dateKey] || 0,
        dayNum: dayCount,
      });
    }

    // Calculate daily budget (budget / trip duration)
    const tripDuration = Math.max(1, days.length);
    const dailyBudget = tripBudget / tripDuration;

    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/f67b22ff-b9f1-49eb-90ce-af684507f178", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "debug-session",
        runId: "pre-fix",
        hypothesisId: "H2",
        location: "BudgetPage.jsx:dailySpendingData",
        message: "Computed daily spending data",
        data: {
          startDate: new Date(normalizedStartDateMs).toISOString(),
          endDate: new Date(tripEndDateMs).toISOString(),
          tripDuration: tripDuration,
          expenseCount: expenses.length,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    return { days, dailyBudget };
  }, [expenses, startDate, endDate, tripBudget]);

  const lineChartData = useMemo(() => {
    if (!dailySpendingData) return null;

    const { days, dailyBudget } = dailySpendingData;

    return {
      labels: days.map((d) => `Day ${d.dayNum}`),
      datasets: [
        {
          label: "Amount Spent",
          data: days.map((d) => d.amount),
          borderColor: "#667eea",
          backgroundColor: "rgba(102, 126, 234, 0.1)",
          borderWidth: 3,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: "#667eea",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          tension: 0.4,
        },
        {
          label: "Daily Budget",
          data: days.map(() => dailyBudget),
          borderColor: "#FF6B6B",
          backgroundColor: "transparent",
          borderWidth: 2,
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0,
          tension: 0,
        },
      ],
    };
  }, [dailySpendingData]);

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          padding: 15,
          font: {
            size: 13,
            weight: 600,
          },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: { size: 14, weight: 600 },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            label += "₹" + context.parsed.y.toFixed(2);
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "₹" + value.toFixed(0);
          },
          font: {
            size: 12,
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        ticks: {
          font: {
            size: 12,
          },
        },
        grid: {
          display: false,
        },
      },
    },
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
            <div className="metric-amount">₹{tripBudget.toFixed(2)}</div>
            <div className="metric-sub">{tripDestination ? `${tripDestination} Getaway` : "Your Trip"}</div>
          </div>
          <div className="metric-card">
            <h4>Amount Spent</h4>
            <div className="metric-amount red">₹{totalSpent.toFixed(2)}</div>
            <div className="metric-sub">{budgetPct}% of budget</div>
          </div>
          <div className="metric-card">
            <h4>Days Left</h4>
            <div className="metric-amount">{daysLeft}</div>
            <div className="metric-sub">Days remaining</div>
          </div>
          <div className="metric-card">
            <h4>Remaining Budget</h4>
            <div className="metric-amount">₹{(tripBudget - totalSpent).toFixed(2)}</div>
            <div className="metric-sub">₹{(daysLeft > 0 ? ((tripBudget - totalSpent) / daysLeft).toFixed(2) : 0)}/day</div>
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
                expenses.map((e, index) => {
                  const cat = CATEGORIES.find((c) => c.key === e.category);
                  // Calculate day number consistently with dailySpendingData
                  const dayNum = computeTripDayNumber(e.date, startDate);
                  const expenseDate = typeof e.date === "string" ? new Date(e.date + "T00:00:00Z") : new Date(e.date);

                  // #region agent log
                  if (index < 5 && startDate) {
                    fetch("http://127.0.0.1:7242/ingest/f67b22ff-b9f1-49eb-90ce-af684507f178", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        sessionId: "debug-session",
                        runId: "pre-fix",
                        hypothesisId: "H3",
                        location: "BudgetPage.jsx:expenseList",
                        message: "Computed day number for expense",
                        data: {
                          expenseId: e.id,
                          expenseDate: expenseDate.toISOString(),
                          startDate: startDate.toISOString(),
                          rawDate: e.date,
                          dayNum: dayNum,
                        },
                        timestamp: Date.now(),
                      }),
                    }).catch(() => {});
                  }
                  // #endregion

                  return (
                    <div key={e.id} className="expense-item">
                      <div className="expense-info">
                        <span style={{ fontSize: "20px", minWidth: "30px" }}>{cat?.emoji}</span>
                        <div>
                          <strong>{e.place}</strong>
                          <br />
                          <div className="badge-container">
                            <span className="category-badge">{cat?.label}</span>
                            <span className="day-badge">Day {dayNum}</span>
                          </div>
                        </div>
                      </div>
                      <div className="expense-amount">₹{parseFloat(e.amount).toFixed(2)}</div>
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
            <h3>📊 Spending Analytics</h3>
            <div className="charts-grid">
              <div className="chart-wrapper">
                <h4>Spending by Category</h4>
                {expenses.length > 0 ? (
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                ) : (
                  <p className="no-chart-data">No expense data to display yet</p>
                )}
              </div>
              <div className="chart-wrapper">
                <h4>Daily Spending vs Budget</h4>
                {expenses.length > 0 && lineChartData ? (
                  <Line data={lineChartData} options={lineChartOptions} />
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
              <button className="modal-close" onClick={() => {
                setShowReceiptModal(false);
                setScanMessage("");
                setReceiptFile(null);
                setReceiptPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}>
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
                <label>Date: {!ocrResult?.detected_date && "⚠️"}</label>
                <input
                  type="date"
                  value={manualExpense.date}
                  onChange={(e) => setManualExpense({ ...manualExpense, date: e.target.value })}
                  title={!ocrResult?.detected_date ? "Date not detected - please verify" : ""}
                  style={!ocrResult?.detected_date ? { borderColor: "#ff9800", borderWidth: "2px" } : {}}
                />
              </div>
              {!ocrResult?.detected_date && manualExpense.date && (
                <div style={{ fontSize: "12px", color: "#ff9800", marginTop: "-10px", marginBottom: "10px" }}>
                  ⚠️ Date not found on receipt
                </div>
              )}
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
              <button className="btn-cancel" onClick={() => {
                setShowReceiptModal(false);
                setScanMessage("");
                setReceiptFile(null);
                setReceiptPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}>
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
