import React from "react";

function ProgressBar({ value = 0 }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className="qp-progress" title={`${pct}% complete`}>
      <div className="qp-track">
        <div className="qp-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="qp-pct">{pct}%</div>
    </div>
  );
}

function QuestPanel({ quests = [], onComplete = () => {} }) {
  return (
    <section className="qp-card">
      <h4>Active Quests</h4>
      <p className="muted">Meaningful experiences you can complete at your own pace.</p>
      <div className="qp-list">
        {quests.map(q => (
          <div key={q.id} className="qp-item" aria-live="polite">
            <div className="qp-left">
              <div className="qp-title">{q.title}</div>
              <div className="qp-desc muted">{q.desc}</div>
            </div>
            <div className="qp-right">
              <ProgressBar value={q.progress} />
              <div className="qp-reward muted">Reward: +{q.reward.xp} XP</div>
              <button className="qp-action" onClick={() => onComplete(q.id)} disabled={q.progress >= 1} aria-disabled={q.progress >= 1}>Mark Complete</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default React.memo(QuestPanel);
