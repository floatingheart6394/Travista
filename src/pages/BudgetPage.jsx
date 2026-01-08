import { useMemo, useState } from "react";
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

const categories = [
  { key: "food", label: "Food" },
  { key: "stay", label: "Stay" },
  { key: "transport", label: "Transport" },
  { key: "shopping", label: "Shopping" },
  { key: "tickets", label: "Tickets" },
  { key: "misc", label: "Miscellaneous" },
];

export default function BudgetPage() {
  const [tripBudget, setTripBudget] = useState(3000);
  const [startDate] = useState(new Date());
  const [endDate] = useState(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
  const [expenses, setExpenses] = useState([
    {
      id: 1,
      place: "Eiffel Tower Tickets",
      amount: 45,
      category: "activities",
      date: new Date("2026-01-05"),
      source: "manual",
    },
    {
      id: 2,
      place: "Le Comptoir Dinner",
      amount: 85,
      category: "food",
      date: new Date("2026-01-05"),
      source: "manual",
    },
    {
      id: 3,
      place: "Hotel Renaissance",
      amount: 180,
      category: "stay",
      date: new Date("2026-01-04"),
      source: "manual",
    },
    {
      id: 4,
      place: "Metro Pass (Week)",
      amount: 22,
      category: "transport",
      date: new Date("2026-01-04"),
      source: "manual",
    },
    {
      id: 5,
      place: "Souvenir Shop",
      amount: 35,
      category: "shopping",
      date: new Date("2026-01-03"),
      source: "manual",
    },
  ]);
  const [scanDraft, setScanDraft] = useState(null);
  const [people, setPeople] = useState(["Priya", "Riya", "Arjun"]);

  const daysLeft = useMemo(() => {
    const diff = endDate.getTime() - Date.now();
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

  function addExpense(exp) {
    setExpenses((prev) => [{ id: Date.now(), ...exp }, ...prev]);
  }

  function deleteExpense(id) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
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

  const donutData = {
    labels: ["Accommodation", "Food", "Transport", "Shopping", "Activities"],
    datasets: [
      {
        data: [800, 450, 350, 200, 600],
        backgroundColor: [
          "#3b82f6",
          "#10b981",
          "#8b5cf6",
          "#f59e0b",
          "#ef5da8",
        ],
        borderWidth: 0,
      },
    ],
  };

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
    const days = byDay.length || 1;
    return Math.round(totalSpent / days);
  }, [totalSpent, byDay]);

  const barData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Daily Spending",
        data: [130, 280, 330, 160, 400, 300, 240],
        backgroundColor: "#14b8a6",
      },
    ],
  };

  const lineData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Budgeted",
        data: [800, 800, 800, 600],
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
        tension: 0.3,
      },
      {
        label: "Actual",
        data: [650, 750, 900, 500],
        borderColor: "#10b981",
        backgroundColor: "#10b981",
        tension: 0.3,
      },
    ],
  };

  const insights = useMemo(() => {
    const tips = [];
    const foodShare = totalSpent
      ? Math.round((byCategory.food / totalSpent) * 100)
      : 0;
    if (foodShare > 35)
      tips.push(`You spent ${foodShare}% on food – try cheaper places nearby.`);
    const avgPerDay = byDay.length ? Math.round(totalSpent / byDay.length) : 0;
    const projected = avgPerDay * daysLeft;
    if (projected > 0)
      tips.push(
        `You may spend approx ₹${projected} in the next ${daysLeft} days.`
      );
    if (totalSpent <= tripBudget)
      tips.push("You are on track to finish within budget.");
    return tips;
  }, [byCategory, totalSpent, byDay, daysLeft, tripBudget]);

  function downloadPDF() {
    const doc = new jsPDF();
    doc.text("TRAVISTA – Budget Summary", 20, 20);
    doc.text(`Total Budget: ₹${tripBudget}`, 20, 35);
    doc.text(`Total Spent: ₹${totalSpent}`, 20, 45);
    doc.text("Expenses:", 20, 60);
    let y = 70;
    expenses.slice(0, 20).forEach((e) => {
      doc.text(
        `${new Date(e.date).toLocaleDateString()} - ${e.place} - ₹${
          e.amount
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
          <p>Smart expense management for your Paris trip</p>
        </section>

        {/* Metric Cards */}
        <section className="metric-cards">
          <div className="metric-card metric--brand">
            <h4>Total Budget</h4>
            <div className="metric-amount">${tripBudget.toLocaleString()}</div>
            <div className="metric-sub">Paris Getaway 2026</div>
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
                  addExpense(scanDraft);
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
                  <li>
                    <span className="dot blue" /> Accommodation{" "}
                    <strong>$800</strong>
                  </li>
                  <li>
                    <span className="dot teal" /> Food <strong>$450</strong>
                  </li>
                  <li>
                    <span className="dot purple" /> Transport{" "}
                    <strong>$350</strong>
                  </li>
                  <li>
                    <span className="dot amber" /> Shopping{" "}
                    <strong>$200</strong>
                  </li>
                  <li>
                    <span className="dot pink" /> Activities{" "}
                    <strong>$600</strong>
                  </li>
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
                <p>
                  You’re spending more on food than average travelers to Paris.
                  Consider local markets for affordable meals!
                </p>
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
