import React from "react";

function CollectionPanel({ collections = [] }) {
  return (
    <div className="collection-card">
      <h4>Memories & Collections</h4>
      <p className="muted">Cultural tokens and memories you've gathered.</p>
      <div className="collection-grid">
        {collections.length === 0 ? (
          <div className="muted small">No memories yet — complete a quest to begin.</div>
        ) : (
          collections.map(c => (
            <div key={c.id} className="collection-item">
              <div className="collection-icon" />
              <div className="collection-title">{c.title}</div>
              <div className="collection-sub muted">{c.region}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default React.memo(CollectionPanel);
