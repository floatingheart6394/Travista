import React from "react";

function RegionModal({ region = null, onClose = () => {}, onClaim = () => {} }) {
  if (!region) return null;

  const locked = !region.unlocked;

  return (
    <div className="rb-modal-overlay" onClick={onClose}>
      <div className="rb-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="rb-header">
          <h3>{region.name}</h3>
          <div className="muted">{region.short}</div>
        </div>
        <div className="rb-body">
          {locked ? (
            <>
              <p className="muted">This region is shrouded in fog. Complete nearby quests or gain new levels to reveal it.</p>
              <div className="rb-hint">Hint: look for coastal stories or market pathways nearby.</div>
            </>
          ) : (
            <>
              <p>Explore gently. Claim a memory token when you're ready — it adds a personal mark to your map.</p>
              <div className="rb-stats">
                <div>Experience value: <strong>{region.xp} XP</strong></div>
                <div>Atmosphere: <em>{region.mood}</em></div>
              </div>
            </>
          )}
        </div>
        <div className="rb-actions">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
          {!locked && <button className="btn btn-primary" onClick={() => { onClaim(region.id); onClose(); }}>Claim Memory</button>}
        </div>
      </div>
    </div>
  );
}

export default React.memo(RegionModal);
