import React from "react";

function ProgressPanel({ xp = 0, level = 1, title = "Explorer", showLevelUp = false }) {
  const next = (level) * 200;
  const progressToNext = Math.round((xp % 200) / 200 * 100);

  const badge = level >= 6 ? "🗺️" : level >= 4 ? "🌿" : level >= 2 ? "🧭" : "✦";

  return (
    <aside className={`pp-card ${showLevelUp ? 'pp-levelup' : ''}`} aria-live="polite">
      {showLevelUp && <div className="pp-levelup-banner">Level Up ✦</div>}
      <div className="pp-top">
        <div>
          <div className="pp-level">{badge} Level {level}</div>
          <div className="pp-title muted">{title}</div>
        </div>
        <div className="pp-xp">{xp} XP</div>
      </div>
      <div className="pp-progress">
        <div className="pp-track">
          <div className="pp-fill" style={{ width: `${progressToNext}%` }} />
        </div>
        <div className="pp-next muted">{progressToNext}% to Level {level + 1}</div>
      </div>
      <div className="pp-note muted">Levels unlock new regions and deeper quests.</div>
    </aside>
  );
}

  export default React.memo(ProgressPanel);
