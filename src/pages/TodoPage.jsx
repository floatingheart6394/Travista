import { useEffect, useMemo, useRef, useState } from "react";
import NewNavbar from "../components/NewNavbar";
import { FiPlus, FiTrash2, FiCheck, FiFilter, FiClipboard, FiStar, FiHome } from "react-icons/fi";
import { FaStar } from "react-icons/fa";

const LS_KEY = "travista_todos";

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

  // AI suggestion inputs removed

  const CATEGORIES = ["Packing", "Booking", "Documents", "Activities", "Other"];
  const GROUPS = ["Before Trip", "During Trip", "After Trip"];

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setItems(JSON.parse(raw));
      else setItems([
        { id: 1, text: "Book flights to Rome", category: "Booking", group: "Before Trip", done: false, priority: "High" },
        { id: 2, text: "Renew passport", category: "Documents", group: "Before Trip", done: true, priority: "Medium" },
        { id: 3, text: "Add emergency contacts", category: "Other", group: "Before Trip", done: false, priority: "Low" },
      ]);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  // simple reminder checker every 60s
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      const updated = [];
      let changed = false;
      for (const it of items) {
        const remindTarget = it.remindAt || it.due;
        if (remindTarget && !it.done && !it.reminded) {
          const t = new Date(remindTarget).getTime();
          if (!isNaN(t) && t <= now) {
            changed = true;
            updated.push({ ...it, reminded: true });
            // Try notification, else alert
            if ("Notification" in window) {
              if (Notification.permission === "granted") {
                new Notification("Task due", { body: it.text });
              } else if (Notification.permission !== "denied") {
                Notification.requestPermission();
              }
            }
            alert(`Reminder: ${it.text}`);
          } else {
            updated.push(it);
          }
        } else updated.push(it);
      }
      if (changed) setItems(updated);
    }, 60000);
    return () => clearInterval(id);
  }, [items]);

  // inline add removed (use Create modal)

  const createFromModal = () => {
    const t = mText.trim();
    if (!t) return;
    let dueISO;
    if (mDate) {
      // just date used to represent due day (no specific time)
      dueISO = new Date(mDate + "T00:00").toISOString();
    }
    let remindAt;
    if (mDate && mRemTime) {
      remindAt = new Date(`${mDate}T${mRemTime}`).toISOString();
    }
    const payload = { id: Date.now(), text: t, desc: mDesc || undefined, category: mCategory, group: mGroup, priority: mPriority, due: dueISO, remindAt, done: false, important: false };
    setItems((prev) => [payload, ...prev]);
    setCreateOpen(false);
    setMText(""); setMDesc(""); setMDate(""); setMRemTime(""); setMGroup("Before Trip"); setMPriority("Medium"); setMCategory("Other");
  };

  const toggle = (id) => setItems((prev) => prev.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));
  const toggleImportant = (id) => setItems((prev) => prev.map((it) => (it.id === id ? { ...it, important: !it.important } : it)));
  const remove = (id) => setItems((prev) => prev.filter((it) => it.id !== id));
  const clearCompleted = () => setItems((prev) => prev.filter((it) => !it.done));

  const shown = useMemo(() => {
    let arr = items;
    if (filter === "active") arr = arr.filter((i) => !i.done);
    if (filter === "completed") arr = arr.filter((i) => i.done);
    if (["Before Trip","During Trip","After Trip"].includes(side)) arr = arr.filter(i=> i.group === side);
    if (side === "Completed") arr = arr.filter(i=> i.done);
    if (side === "Important") arr = arr.filter(i=> i.important);
    return arr;
  }, [items, filter, side]);

  const remaining = items.filter((i) => !i.done).length;
  const completed = items.length - remaining;
  const percent = items.length ? Math.round((completed / items.length) * 100) : 0;

  // Grouped views
  const byGroup = useMemo(() => {
    const base = { "Before Trip": [], "During Trip": [], "After Trip": [] };
    for (const it of shown) {
      base[it.group || "Before Trip"].push(it);
    }
    return base;
  }, [shown]);
  const visibleGroups = useMemo(() => {
    return ["Before Trip","During Trip","After Trip"].includes(side) ? [side] : GROUPS;
  }, [side]);

  // AI suggestions removed

  return (
    <div className="dashboard-page">
      <NewNavbar />
      <main className="dashboard-content">
        <div className="todo-layout">
          <aside className="todo-sidebar">
            <button className="s-create" onClick={()=>setCreateOpen(true)}><FiPlus /> Create</button>
            <nav className="snav">
              <button className={`sitem ${side==='All tasks'?'active':''}`} onClick={()=>setSide('All tasks')}>
                <FiHome /><span>Tasks</span>
                <span className="count">{items.length}</span>
              </button>
              <button className={`sitem ${side==='Important'?'active':''}`} onClick={()=>setSide('Important')}>
                <FiStar /><span>Important</span>
                <span className="count">{items.filter(i=>i.important).length}</span>
              </button>
            </nav>
            <div className="list-section">
              <h5>Lists</h5>
              <button className={`sitem ${side==='All tasks'?'active':''}`} onClick={()=>setSide('All tasks')}>
                <span>All tasks</span>
                <span className="count">{items.length}</span>
              </button>
              {GROUPS.map(g => (
                <button key={g} className={`sitem ${side===g?'active':''}`} onClick={()=>setSide(g)}>
                  <span>{g}</span>
                  <span className="count">{items.filter(i=>i.group===g).length}</span>
                </button>
              ))}
              <button className={`sitem ${side==='Completed'?'active':''}`} onClick={()=>setSide('Completed')}>
                <span>Completed</span>
                <span className="count">{items.filter(i=>i.done).length}</span>
              </button>
            </div>
          </aside>
          <div className="todo-wrap">
          <div className="todo-top">
            {/* Progress card */}
            <div className="todo-progress card-lite">
              <div className="tp-head"><FiClipboard /><span>Progress</span></div>
              <div className="tp-sub">{completed} of {items.length} tasks completed</div>
              <div className="tp-bar"><span style={{ width: `${percent}%` }} /></div>
            </div>

            {/* Filters / tools */}
            <section className="todo-toolbar card-lite">
              <div className="filters">
                <button className={`pill ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
                <button className={`pill ${filter === "active" ? "active" : ""}`} onClick={() => setFilter("active")}>Active</button>
                <button className={`pill ${filter === "completed" ? "active" : ""}`} onClick={() => setFilter("completed")}>Completed</button>
              </div>
              <div className="tools">
                <button className="outline" onClick={clearCompleted}><FiFilter /> Clear Completed</button>
                <div className="toggle-view">
                  <button className={`pill ${view==='board'?'active':''}`} onClick={()=>setView('board')}>Board</button>
                  <button className={`pill ${view==='list'?'active':''}`} onClick={()=>setView('list')}>List</button>
                </div>
              </div>
            </section>
          </div>

          {view === 'board' ? (
            <section className={`todo-board ${visibleGroups.length===1 ? 'single' : ''}`}>
              {visibleGroups.map((g)=> (
                <div key={g} className="board-col">
                  <div className="board-head">{g}</div>
                  <div className="board-list">
                    {(byGroup[g]||[]).length === 0 && (
                      <div className="empty small">No tasks yet</div>
                    )}
                    {(byGroup[g]||[]).map((it) => (
                      <article key={it.id} className={`bcard ${it.done ? 'done':''}`}>
                        <button className={`check ${it.done ? 'checked' : ''}`} onClick={() => toggle(it.id)} aria-label={it.done ? 'Mark as not done' : 'Mark as done'}>
                          <FiCheck />
                        </button>
                        <div className="text" onClick={() => toggle(it.id)}>
                          <div>{it.text}</div>
                          {it.desc && <div className="desc">{it.desc}</div>}
                          <div className="meta">
                            {it.category && <span className="mini-chip">{it.category}</span>}
                            {it.priority && <span className="mini-chip">{it.priority}</span>}
                            {it.due && <span className="mini-chip">{new Date(it.due).toLocaleString()}</span>}
                          </div>
                        </div>
                        <button className={`icon-btn star ${it.important ? 'active' : ''}`} onClick={() => toggleImportant(it.id)} aria-label="Toggle important">
                          {it.important ? <FaStar /> : <FiStar />}
                        </button>
                        <button className="danger" onClick={() => remove(it.id)} aria-label="Delete task"><FiTrash2 /></button>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ) : (
            <section className="todo-list">
              {shown.length === 0 && (
                <div className="empty">No tasks here. Add your first one!</div>
              )}
              {GROUPS.map((g)=> (
                <div key={g} className="group-block">
                  <h3 className="group-title">{g}</h3>
                  {(byGroup[g]||[]).map((it) => (
                    <article key={it.id} className={`todo-item ${it.done ? "done" : ""}`}>
                      <button className={`check ${it.done ? 'checked' : ''}`} onClick={() => toggle(it.id)} aria-label={it.done ? "Mark as not done" : "Mark as done"}>
                        <FiCheck />
                      </button>
                      <div className="text" onClick={() => toggle(it.id)}>
                        <div>{it.text}</div>
                        {it.desc && <div className="desc">{it.desc}</div>}
                        <div className="meta">
                          {it.category && <span className="mini-chip">{it.category}</span>}
                          {it.priority && <span className="mini-chip">{it.priority}</span>}
                          {it.due && <span className="mini-chip">{new Date(it.due).toLocaleString()}</span>}
                        </div>
                      </div>
                      <button className={`icon-btn star ${it.important ? 'active' : ''}`} onClick={() => toggleImportant(it.id)} aria-label="Toggle important">
                        {it.important ? <FaStar /> : <FiStar />}
                      </button>
                      <button className="danger" onClick={() => remove(it.id)} aria-label="Delete task"><FiTrash2 /></button>
                    </article>
                  ))}
                </div>
              ))}
            </section>
          )}
          </div>
        </div>
        {isCreateOpen && (
          <div className="todo-modal-overlay" onClick={()=>setCreateOpen(false)}>
            <div className="todo-modal" onClick={(e)=>e.stopPropagation()}>
              <div className="modal-head">Create Task</div>
              <div className="modal-body">
                <input className="full" placeholder="Task title" value={mText} onChange={(e)=>setMText(e.target.value)} />
                <textarea className="full tall" placeholder="Task description (optional)" value={mDesc} onChange={(e)=>setMDesc(e.target.value)} />
                <div>
                  <label style={{fontWeight:600, color:'#333'}}>Category:</label>
                  <div className="chips" style={{marginTop:8}}>
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        className={`chip ${mCategory === c ? 'active' : ''}`}
                        onClick={() => setMCategory(c)}
                      >{c}</button>
                    ))}
                  </div>
                </div>
                <div className="grid2">
                  <input type="date" value={mDate} onChange={(e)=>setMDate(e.target.value)} />
                  <input type="time" value={mRemTime} onChange={(e)=>setMRemTime(e.target.value)} />
                </div>
                <div className="grid2">
                  <select value={mGroup} onChange={(e)=>setMGroup(e.target.value)}>
                    {GROUPS.map(g=> <option key={g}>{g}</option>)}
                  </select>
                  <select value={mPriority} onChange={(e)=>setMPriority(e.target.value)}>
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button className="outline" onClick={()=>setCreateOpen(false)}>Cancel</button>
                <button className="btn-orange" onClick={createFromModal}><FiPlus /> Create</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
