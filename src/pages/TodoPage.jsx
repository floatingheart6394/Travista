import { useEffect, useMemo, useState } from "react";
import NewNavbar from "../components/NewNavbar";
import {FiPlus, FiTrash2, FiCheck, FiFilter, FiClipboard, FiStar,} from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import {fetchTodos,createTodo, updateTodo, deleteTodo,} from "../services/todoService";

const TODO_CACHE_KEY = "travista.todo.cache";
const PLANNER_CACHE_KEY = "travista.planner.cache";

export default function TodoPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("board");
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [mText, setMText] = useState("");
  const [mDesc, setMDesc] = useState("");
  const [mDate, setMDate] = useState("");
  const [mRemTime, setMRemTime] = useState("");
  const [mGroup, setMGroup] = useState("Before Trip");
  const [mPriority, setMPriority] = useState("Medium");
  const [mCategory, setMCategory] = useState("Other");
  const [side, setSide] = useState("All tasks");

  const isTripActive = () => {
    try {
      const raw = localStorage.getItem(PLANNER_CACHE_KEY);
      if (!raw) return true; // keep if no planner
      const cached = JSON.parse(raw);
      if (!cached.endDate) return true;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tripEnd = new Date(cached.endDate);
      return tripEnd >= today;
    } catch (e) {
      console.error("Failed to read planner cache for todo expiration", e);
      return true;
    }
  };

  const loadCachedTodos = () => {
    try {
      const raw = localStorage.getItem(TODO_CACHE_KEY);
      if (!raw) return null;
      const cached = JSON.parse(raw);
      if (!isTripActive()) {
        localStorage.removeItem(TODO_CACHE_KEY);
        return null;
      }
      return cached.items || [];
    } catch (e) {
      console.error("Failed to load cached todos", e);
      return null;
    }
  };

  const persistTodos = (arr) => {
    try {
      localStorage.setItem(
        TODO_CACHE_KEY,
        JSON.stringify({ items: arr, savedAt: new Date().toISOString() })
      );
    } catch (e) {
      console.error("Failed to cache todos", e);
    }
  };

  const loadTodos = async () => {
    // Optimistically show cached todos if any
    const cached = loadCachedTodos();
    if (cached) setItems(cached);

    try {
      const data = await fetchTodos();

      const mapped = data.map((t) => ({
        id: t.id,
        text: t.title,
        desc: t.description,
        category: t.category,
        group: t.group,
        priority: t.priority,
        due: t.due_at,
        remindAt: t.remind_at,
        done: t.is_done,
        important: t.is_important,
      }));

      setItems(mapped);
      persistTodos(mapped);
    } catch (err) {
      console.error("Failed to load todos", err);
      // Fall back to cache if fetch fails
      if (cached) {
        setItems(cached);
      }
    }
  };


  const CATEGORIES = ["Packing", "Booking", "Documents", "Activities", "Other"];
  const GROUPS = ["Before Trip", "During Trip", "After Trip"];

  useEffect(() => {
    loadTodos();
  }, []);

  const createFromModal = async () => {
    const t = mText.trim();
    if (!t) return;
    let dueISO;
    if (mDate) {
      dueISO = new Date(mDate + "T00:00").toISOString();
    }
    let remindAt;
    if (mDate && mRemTime) {
      remindAt = new Date(`${mDate}T${mRemTime}`).toISOString();
    }
    const payload = {
      title: t,
      description: mDesc || null,
      category: mCategory,
      group: mGroup,
      priority: mPriority,
      due_at: dueISO || null,
      remind_at: remindAt || null,
      is_done: false,
      is_important: false,
    };
    
    await createTodo(payload);
    loadTodos();

    setCreateOpen(false);
    setMText("");
    setMDesc("");
    setMDate("");
    setMRemTime("");
    setMGroup("Before Trip");
    setMPriority("Medium");
    setMCategory("Other");
  };

  const toggle = async (id) => {
    const todo = items.find((i) => i.id === id);
    await updateTodo(id, { is_done: !todo.done });
    loadTodos();
  };

  const toggleImportant = async (id) => {
    const todo = items.find((i) => i.id === id);
    await updateTodo(id, { is_important: !todo.important });
    loadTodos();
  };

  const remove = async (id) => {
    await deleteTodo(id);
    loadTodos();
  };

  const clearCompleted = async () => {
    const completedTodos = items.filter((it) => it.done);

    for (const todo of completedTodos) {
      await deleteTodo(todo.id);
    }

    loadTodos();
  };

  const shown = useMemo(() => {
    let arr = items;
    if (filter === "active") arr = arr.filter((i) => !i.done);
    if (filter === "completed") arr = arr.filter((i) => i.done);
    if (["Before Trip", "During Trip", "After Trip"].includes(side))
      arr = arr.filter((i) => i.group === side);
    if (side === "Completed") arr = arr.filter((i) => i.done);
    if (side === "Important") arr = arr.filter((i) => i.important);
    return arr;
  }, [items, filter, side]);

  const remaining = items.filter((i) => !i.done).length;
  const completed = items.length - remaining;
  const percent = items.length
    ? Math.round((completed / items.length) * 100)
    : 0;

  const byGroup = useMemo(() => {
    const base = { "Before Trip": [], "During Trip": [], "After Trip": [] };
    for (const it of shown) {
      base[it.group || "Before Trip"].push(it);
    }
    return base;
  }, [shown]);
  const visibleGroups = useMemo(() => {
    return ["Before Trip", "During Trip", "After Trip"].includes(side)
      ? [side]
      : GROUPS;
  }, [side]);

  return (
    <div className="dashboard-page">
      <NewNavbar />
      <main className="dashboard-content">
        <div className="todo-layout">
          <aside className="todo-sidebar">
            <button className="s-create" onClick={() => setCreateOpen(true)}>
              <FiPlus /> Create
            </button>
            <nav className="snav">
              <button
                className={`sitem ${side === "Important" ? "active" : ""}`}
                onClick={() => setSide("Important")}
              >
                <FiStar />
                <span>Important</span>
                <span className="count">
                  {items.filter((i) => i.important).length}
                </span>
              </button>
            </nav>
            <div className="list-section">
              <h5>Lists</h5>
              <button
                className={`sitem ${side === "All tasks" ? "active" : ""}`}
                onClick={() => setSide("All tasks")}
              >
                <span>All tasks</span>
                <span className="count">{items.length}</span>
              </button>
              {GROUPS.map((g) => (
                <button
                  key={g}
                  className={`sitem ${side === g ? "active" : ""}`}
                  onClick={() => setSide(g)}
                >
                  <span>{g}</span>
                  <span className="count">
                    {items.filter((i) => i.group === g).length}
                  </span>
                </button>
              ))}
            </div>
          </aside>
          <div className="todo-wrap">
            <div className="todo-top">
              <div className="todo-progress card-lite">
                <div className="tp-head">
                  <FiClipboard />
                  <span>Progress</span>
                </div>
                <div className="tp-sub">
                  {completed} of {items.length} tasks completed
                </div>
                <div className="tp-bar">
                  <span style={{ width: `${percent}%` }} />
                </div>
              </div>

              <section className="todo-toolbar card-lite">
                <div className="filters">
                  <button
                    className={`pill ${filter === "all" ? "active" : ""}`}
                    onClick={() => setFilter("all")}
                  >
                    All
                  </button>
                  <button
                    className={`pill ${filter === "active" ? "active" : ""}`}
                    onClick={() => setFilter("active")}
                  >
                    Active
                  </button>
                  <button
                    className={`pill ${filter === "completed" ? "active" : ""}`}
                    onClick={() => setFilter("completed")}
                  >
                    Completed
                  </button>
                </div>
                <div className="tools">
                  <button className="outline" onClick={clearCompleted}>
                    <FiFilter /> Clear Completed
                  </button>
                  <div className="toggle-view">
                    <button
                      className={`pill ${view === "board" ? "active" : ""}`}
                      onClick={() => setView("board")}
                    >
                      Board
                    </button>
                    <button
                      className={`pill ${view === "list" ? "active" : ""}`}
                      onClick={() => setView("list")}
                    >
                      List
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {view === "board" ? (
              <section
                className={`todo-board ${
                  visibleGroups.length === 1 ? "single" : ""
                }`}
              >
                {visibleGroups.map((g) => (
                  <div key={g} className="board-col">
                    <div className="board-head">{g}</div>
                    <div className="board-list">
                      {(byGroup[g] || []).length === 0 && (
                        <div className="empty small">No tasks yet</div>
                      )}
                      {(byGroup[g] || []).map((it) => (
                        <article
                          key={it.id}
                          className={`bcard ${it.done ? "done" : ""}`}
                        >
                          <button
                            className={`check ${it.done ? "checked" : ""}`}
                            onClick={() => toggle(it.id)}
                            aria-label={
                              it.done ? "Mark as not done" : "Mark as done"
                            }
                          >
                            <FiCheck />
                          </button>
                          <div className="text" onClick={() => toggle(it.id)}>
                            <div>{it.text}</div>
                            {it.desc && <div className="desc">{it.desc}</div>}
                            <div className="meta">
                              {it.category && (
                                <span className="mini-chip">{it.category}</span>
                              )}
                              {it.priority && (
                                <span className="mini-chip">{it.priority}</span>
                              )}
                              {it.due && (
                                <span className="mini-chip">
                                  {new Date(it.due).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            className={`icon-btn star ${
                              it.important ? "active" : ""
                            }`}
                            onClick={() => toggleImportant(it.id)}
                            aria-label="Toggle important"
                          >
                            {it.important ? <FaStar /> : <FiStar />}
                          </button>
                          <button
                            className="danger"
                            onClick={() => remove(it.id)}
                            aria-label="Delete task"
                          >
                            <FiTrash2 />
                          </button>
                        </article>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            ) : (
              <section className="todo-list">
                {shown.length === 0 && (
                  <div className="empty">
                    No tasks here. Add your first one!
                  </div>
                )}
                {GROUPS.map((g) => (
                  <div key={g} className="group-block">
                    <h3 className="group-title">{g}</h3>
                    {(byGroup[g] || []).map((it) => (
                      <article
                        key={it.id}
                        className={`todo-item ${it.done ? "done" : ""}`}
                      >
                        <button
                          className={`check ${it.done ? "checked" : ""}`}
                          onClick={() => toggle(it.id)}
                          aria-label={
                            it.done ? "Mark as not done" : "Mark as done"
                          }
                        >
                          <FiCheck />
                        </button>
                        <div className="text" onClick={() => toggle(it.id)}>
                          <div>{it.text}</div>
                          {it.desc && <div className="desc">{it.desc}</div>}
                          <div className="meta">
                            {it.category && (
                              <span className="mini-chip">{it.category}</span>
                            )}
                            {it.priority && (
                              <span className="mini-chip">{it.priority}</span>
                            )}
                            {it.due && (
                              <span className="mini-chip">
                                {new Date(it.due).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          className={`icon-btn star ${
                            it.important ? "active" : ""
                          }`}
                          onClick={() => toggleImportant(it.id)}
                          aria-label="Toggle important"
                        >
                          {it.important ? <FaStar /> : <FiStar />}
                        </button>
                        <button
                          className="danger"
                          onClick={() => remove(it.id)}
                          aria-label="Delete task"
                        >
                          <FiTrash2 />
                        </button>
                      </article>
                    ))}
                  </div>
                ))}
              </section>
            )}
          </div>
        </div>
        {isCreateOpen && (
          <div
            className="todo-modal-overlay"
            onClick={() => setCreateOpen(false)}
          >
            <div className="todo-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">Create Task</div>
              <div className="modal-body">
                <input
                  className="full"
                  placeholder="Task title"
                  value={mText}
                  onChange={(e) => setMText(e.target.value)}
                />
                <textarea
                  className="full tall"
                  placeholder="Task description (optional)"
                  value={mDesc}
                  onChange={(e) => setMDesc(e.target.value)}
                />
                <div>
                  <label style={{ fontWeight: 600, color: "#333" }}>
                    Category:
                  </label>
                  <div className="chips" style={{ marginTop: 8 }}>
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        className={`chip ${mCategory === c ? "active" : ""}`}
                        onClick={() => setMCategory(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid2">
                  <input
                    type="date"
                    value={mDate}
                    onChange={(e) => setMDate(e.target.value)}
                  />
                  <input
                    type="time"
                    value={mRemTime}
                    onChange={(e) => setMRemTime(e.target.value)}
                  />
                </div>
                <div className="grid2">
                  <select
                    value={mGroup}
                    onChange={(e) => setMGroup(e.target.value)}
                  >
                    {GROUPS.map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                  <select
                    value={mPriority}
                    onChange={(e) => setMPriority(e.target.value)}
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button
                  className="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </button>
                <button className="btn-orange" onClick={createFromModal}>
                  <FiPlus /> Create
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
