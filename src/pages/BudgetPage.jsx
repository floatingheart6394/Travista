import { useMemo, useState, useEffect } from "react";
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
const categories = [
  { key: "food", label: "Food" },
  { key: "stay", label: "Stay" },
  { key: "transport", label: "Transport" },
  { key: "shopping", label: "Shopping" },
  { key: "activities", label: "Activities" },
  { key: "misc", label: "Miscellaneous" },
];

export default function BudgetPage() {
  const [tripBudget, setTripBudget] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [activeTripId, setActiveTripId] = useState(null);
  const [scanDraft, setScanDraft] = useState(null);
  const [people, setPeople] = useState(["Priya", "Riya", "Arjun"]);
  const [tripDestination, setTripDestination] = useState("");
  const [manualExpense, setManualExpense] = useState({
    place: "",
    amount: "",
    category: "food",
    date: new Date().toISOString().slice(0, 10),
  });

  async function fetchExpenses(tripId) {
    if (!tripId) return;

    try {
      const res = await fetch(
        `${API_URL}/budget/expenses/?trip_id=${tripId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (!res.ok) return;

      const data = await res.json();
      setExpenses(
        data.map((e) => ({
          ...e,
          date: new Date(e.date),
        }))
      );
    } catch (err) {
      console.error("Failed to fetch expenses", err);
    }
  }

  useEffect(() => {
    async function loadBudgetData() {
      try {
        const token = localStorage.getItem("access_token");

        const tripRes = await fetch(`${API_URL}/trip/active`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!tripRes.ok) return;

        const trip = await tripRes.json();

        setActiveTripId(trip.id);              // ✅ STORE trip id
        setTripBudget(trip.budget ?? 0);
        setTripDestination(trip.destination ?? "");
        // derive dates from duration
        const start = new Date();
        const end = new Date(
          Date.now() + (trip.duration || 1) * 24 * 60 * 60 * 1000
        );

        setStartDate(start);
        setEndDate(end);

        // ✅ FETCH EXPENSES FOR THIS TRIP ONLY
        await fetchExpenses(trip.id);

      } catch (err) {
        console.error(err);
      }
    }

    loadBudgetData();
  }, []);

  const daysLeft = useMemo(() => {
    if (!endDate) return 0;
    const diff = new Date(endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
  }, [endDate]);


  const totalSpent = useMemo(
    () => expenses.reduce((s, e) => s + Number(e.amount || 0), 0),
    [expenses]
  );
  const remaining = Math.max(0, tripBudget - totalSpent);
  const budgetPct = Math.min(
    100,
    Math.round((totalSpent / Math.max(1, tripBudget)) * 100)
  );
  const ringColor =
    budgetPct < 60 ? "#22c55e" : budgetPct < 85 ? "#eab308" : "#ef4444";

  async function addExpense(exp) {
    try {
      const res = await fetch(`${API_URL}/budget/expense`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(exp),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Add expense failed", err);
        return;
      }

      await fetchExpenses(activeTripId);
    } catch (err) {
      console.error("Failed to add expense", err);
    }
  }

  async function submitManualExpense() {
    if (!manualExpense.place || !manualExpense.amount) {
      alert("Please enter place and amount");
      return;
    }

    await addExpense({
      place: manualExpense.place,
      amount: Number(manualExpense.amount),
      category: manualExpense.category,
      date: manualExpense.date,
      source: "manual",
      trip_id: activeTripId,
    });

    // reset form
    setManualExpense({
      place: "",
      amount: "",
      category: "food",
      date: new Date().toISOString().slice(0, 10),
    });
  }


  async function deleteExpense(id) {
    if (!window.confirm("Delete this expense?")) return;

    try {
      await fetch(`${API_URL}/budget/expense/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      await fetchExpenses(activeTripId);
    } catch (err) {
      console.error(err);
    }
  }



  // OCR stub: pulls amount from filename if present, allows edit before confirm
  function handleScanFile(file) {
    if (!file) return;
    const guess = /\d{2,6}/.exec(file.name || "");
    const amount = guess ? Number(guess[0]) : 480;
    setScanDraft({
      place: "Scanned Shop",
      amount,
      category: "food",
      date: new Date(),
      source: "ocr",
    });
  }

  // Charts data
  const byCategory = useMemo(() => {
    const map = Object.fromEntries(categories.map((c) => [c.key, 0]));
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  }, [expenses]);

  const donutData = useMemo(() => ({
    labels: categories.map(c => c.label),
    datasets: [
      {
        data: categories.map(c => byCategory[c.key] || 0),
        backgroundColor: [
          "#3b82f6",
          "#10b981",
          "#8b5cf6",
          "#f59e0b",
          "#ef5da8",
          "#64748b",
        ],
        borderWidth: 0,
      },
    ],
  }), [byCategory]);

  const byDay = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const k = new Date(e.date).toDateString();
      map[k] = (map[k] || 0) + e.amount;
    });
    const entries = Object.entries(map).sort(
      (a, b) => new Date(a[0]) - new Date(b[0])
    );
    return entries;
  }, [expenses]);

  const avgDaily = useMemo(() => {
    const daysSoFar = Math.max(1, byDay.length);
    return Math.round(totalSpent / daysSoFar);
  }, [totalSpent, byDay]);


  const barData = useMemo(() => {
    const map = {};

    expenses.forEach((e) => {
      const day = new Date(e.date).toLocaleDateString(undefined, {
        weekday: "short",
      });
      map[day] = (map[day] || 0) + e.amount;
    });

    return {
      labels: Object.keys(map),
      datasets: [
        {
          label: "Daily Spending",
          data: Object.values(map),
          backgroundColor: "#14b8a6",
        },
      ],
    };
  }, [expenses]);


  const lineData = useMemo(() => {
    const cumulative = [];
    let sum = 0;

    expenses
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach((e) => {
        sum += e.amount;
        cumulative.push(sum);
      });

    return {
      labels: cumulative.map((_, i) => `Day ${i + 1}`),
      datasets: [
        {
          label: "Actual Spending",
          data: cumulative,
          borderColor: "#10b981",
          backgroundColor: "#10b981",
          tension: 0.3,
        },
        {
          label: "Budget",
          data: cumulative.map(() => tripBudget),
          borderColor: "#3b82f6",
          backgroundColor: "#3b82f6",
          borderDash: [5, 5],
          tension: 0.3,
        },
      ],
    };
  }, [expenses, tripBudget]);

  const insights = useMemo(() => {
    if (!expenses.length || tripBudget === 0) {
      return ["Start adding expenses to get smart insights."];
    }

    const tips = [];

    // 1️⃣ Highest spending category
    const categoryTotals = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] =
        (categoryTotals[e.category] || 0) + e.amount;
    });

    const [topCategory, topAmount] = Object.entries(categoryTotals).sort(
      (a, b) => b[1] - a[1]
    )[0];

    const categoryPct = Math.round((topAmount / totalSpent) * 100);

    tips.push(
      `${categoryLabel(topCategory)} accounts for ${categoryPct}% of your spending. Consider reviewing these expenses.`
    );

    // 2️⃣ Budget health
    if (budgetPct < 60) {
      tips.push("You are well within your budget. Great job managing expenses!");
    } else if (budgetPct < 85) {
      tips.push("You’ve used more than half of your budget. Keep an eye on daily spending.");
    } else {
      tips.push("⚠️ Budget usage is high. You may exceed your planned budget.");
    }

    // 3️⃣ Spending pace projection
    const daysSpent = byDay.length || 1;
    const avgPerDay = Math.round(totalSpent / daysSpent);
    const projectedTotal = avgPerDay * (daysSpent + daysLeft);

    if (projectedTotal > tripBudget) {
      tips.push(
        `At the current pace, you may exceed your budget by ₹${projectedTotal - tripBudget}.`
      );
    } else {
      tips.push("Your current spending pace aligns well with your budget.");
    }

    return tips.slice(0, 3); // keep UI clean
  }, [expenses, totalSpent, tripBudget, budgetPct, byDay, daysLeft]);


  function downloadPDF() {
    const doc = new jsPDF();
    doc.text("TRAVISTA – Budget Summary", 20, 20);
    doc.text(`Total Budget: ₹${tripBudget}`, 20, 35);
    doc.text(`Total Spent: ₹${totalSpent}`, 20, 45);
    doc.text("Expenses:", 20, 60);
    let y = 70;
    expenses.slice(0, 20).forEach((e) => {
      doc.text(
        `${new Date(e.date).toLocaleDateString()} - ${e.place} - ₹${e.amount
        } - ${e.category}`,
        20,
        y
      );
      y += 8;
    });
    doc.save("travista-budget.pdf");
  }

  function exportExcel() {
    const rows = expenses.map((e) => ({
      Date: new Date(e.date).toLocaleDateString(),
      Place: e.place,
      Amount: e.amount,
      Category: e.category,
      Source: e.source,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");
    XLSX.writeFile(wb, "travista-budget.xlsx");
  }

  // Simple group split: everyone owes equal share
  const splitSummary = useMemo(() => {
    const total = totalSpent;
    const perHead = people.length
      ? Math.round((total / people.length) * 100) / 100
      : 0;
    return people.map((p) => ({ name: p, owes: perHead }));
  }, [people, totalSpent]);

  return (
    <div className="dashboard-page">
      <NewNavbar />
      <main className="smart-budget" aria-label="Smart Budget page">
        {/* Hero */}
        <section className="budget-hero">
          <h1>
            Budget Tracker <span>💰</span>
          </h1>
          <p>Smart expense management for your {tripDestination || "trip"} trip...</p>
        </section>

        {/* Metric Cards */}
        <section className="metric-cards">
          <div className="metric-card metric--brand">
            <h4>Total Budget</h4>
            <div className="metric-amount">${tripBudget.toLocaleString()}</div>
            <div className="metric-sub">{tripDestination
              ? `${tripDestination} Getaway`
              : "Your Trip"}
            </div>
          </div>
          <div className="metric-card">
            <h4>Amount Spent</h4>
            <div className="metric-amount red">
              ${totalSpent.toLocaleString()}
            </div>
            <div className="metric-sub">{budgetPct}% of budget</div>
          </div>
          <div className="metric-card">
            <h4>Remaining</h4>
            <div className="metric-amount green">
              ${remaining.toLocaleString()}
            </div>
            <div className="metric-sub">
              {Math.max(0, 100 - budgetPct)}% left
            </div>
          </div>
          <div className="metric-card">
            <h4>Avg. Daily Spend</h4>
            <div className="metric-amount purple">${avgDaily}</div>
            <div className="metric-sub">Last {byDay.length} days</div>
          </div>
        </section>

        {/* Progress */}
        <section className="progress-card">
          <div className="progress-header">
            <h3>Budget Progress</h3>
            <span className="progress-label">{budgetPct}% used</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${budgetPct}%` }} />
          </div>
        </section>

        {/* Scan Draft Confirm */}
        {scanDraft && (
          <section className="scan-draft">
            <h3>Scanned Receipt</h3>
            <div className="draft-row">
              <input
                value={scanDraft.place}
                onChange={(e) =>
                  setScanDraft({ ...scanDraft, place: e.target.value })
                }
              />
              <input
                type="number"
                value={scanDraft.amount}
                onChange={(e) =>
                  setScanDraft({ ...scanDraft, amount: Number(e.target.value) })
                }
              />
              <select
                value={scanDraft.category}
                onChange={(e) =>
                  setScanDraft({ ...scanDraft, category: e.target.value })
                }
              >
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  const payload = {
                    ...scanDraft,
                    trip_id: activeTripId,
                  };

                  console.log("🚀 Expense payload being sent:", payload);

                  addExpense(payload);
                  setScanDraft(null);
                }}
              >
                Confirm
              </button>

              <button className="outline" onClick={() => setScanDraft(null)}>
                Cancel
              </button>
            </div>
            <p>
              ₹{scanDraft.amount} added to{" "}
              {categories.find((c) => c.key === scanDraft.category)?.label}
            </p>
          </section>
        )}

        {/* Two-column main area: charts (left) + recent/actions (right) */}
        <section className="budget-two-col">
          <div className="left">
            <div className="chart-card">
              <h3>Spending by Category</h3>
              <div className="chart-grid">
                <div className="chart-main">
                  <Doughnut data={donutData} />
                </div>
                <ul className="chart-legend">
                  {categories.map(c => (
                    <li key={c.key}>
                      <span className={`dot ${c.key}`} />
                      {c.label} <strong>${byCategory[c.key] || 0}</strong>
                    </li>
                  ))}
                </ul>

              </div>
            </div>
            <div className="chart-card">
              <h3>Daily Spending</h3>
              <Bar
                data={barData}
                options={{ plugins: { legend: { display: false } } }}
              />
            </div>
          </div>
          <aside className="right">
            <div className="manual-expense card">
              <h3>Add Expense</h3>

              <input
                placeholder="Place / Description"
                value={manualExpense.place}
                onChange={(e) =>
                  setManualExpense({ ...manualExpense, place: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Amount"
                value={manualExpense.amount}
                onChange={(e) =>
                  setManualExpense({ ...manualExpense, amount: e.target.value })
                }
              />

              <select
                value={manualExpense.category}
                onChange={(e) =>
                  setManualExpense({ ...manualExpense, category: e.target.value })
                }
              >
                {categories.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={manualExpense.date}
                onChange={(e) =>
                  setManualExpense({ ...manualExpense, date: e.target.value })
                }
              />

              <button
                className="cta"
                disabled={!activeTripId}
                onClick={submitManualExpense}
              >
                Add Expense
              </button>
            </div>

            <div className="recent">
              <div className="recent-header">
                <h3>Recent Expenses</h3>
                <a>View All</a>
              </div>
              <div className="cards-list">
                {expenses.map((e) => (
                  <div key={e.id} className="expense-card">
                    <div className="expense-main">
                      <strong>{e.place}</strong>
                      <span>${e.amount}</span>
                    </div>
                    <div className="expense-meta">
                      <span>{categoryLabel(e.category)}</span>
                      <span>
                        {new Date(e.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <button
                      className="delete-btn"
                      onClick={() => deleteExpense(e.id)}
                    >
                      🗑️
                    </button>
                  </div>

                ))}
              </div>
            </div>
            <div className="actions">
              <label className="cta gradient">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleScanFile(e.target.files?.[0])}
                />
                <span>Upload Receipt (OCR)</span>
              </label>
              <button
                className="cta"
                onClick={() => {
                  downloadPDF();
                  exportExcel();
                }}
              >
                Export Report
              </button>
              <div className="tip-box">
                <h4>Budget Tip</h4>
                <div className="tip-box">
                  <ul>
                    {insights.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {/* Budget vs Actual */}
        <section className="chart-card">
          <h3>Budget vs Actual Spending</h3>
          <Line data={lineData} />
        </section>

        {/* Optional sections kept minimal for now */}
      </main>
    </div>
  );
}

function categoryLabel(key) {
  switch (key) {
    case "stay":
      return "Accommodation";
    case "food":
      return "Food";
    case "transport":
      return "Transport";
    case "shopping":
      return "Shopping";
    case "activities":
      return "Activities";
    default:
      return key;
  }
}
