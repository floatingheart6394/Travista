import React, { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Helper: normalize coordinate fields and validate
function normalizeCoords(h) {
  // Accept several common key names but prefer explicit numeric 'latitude' and 'longitude'
  const rawLat = h.latitude ?? h.lat ?? h.latitude ?? h.latitudeString ?? h.latString ?? h.latitude_str;
  const rawLng = h.longitude ?? h.lng ?? h.longitude ?? h.longitudeString ?? h.lngString ?? h.longitude_str;
  const lat = rawLat === undefined ? undefined : Number(rawLat);
  const lng = rawLng === undefined ? undefined : Number(rawLng);
  const valid = Number.isFinite(lat) && Number.isFinite(lng);
  return { latitude: lat, longitude: lng, valid };
}

// Memoized marker component — does not update on unrelated prop changes
const HotspotMarker = React.memo(function HotspotMarker({ id, latitude, longitude, isUnlocked, isActive, onClick }) {
  const unlockedFlag = !!isUnlocked;
  const color = unlockedFlag ? "#2b6f8f" : "#9aa6ad";
  const radius = isActive ? 10 : 7;

  return (
    <CircleMarker
      key={id}
      center={[latitude, longitude]}
      radius={radius}
      pathOptions={{ color, fillColor: color, fillOpacity: unlockedFlag ? 0.9 : 0.5 }}
      eventHandlers={{ click: () => onClick(id) }}
      className={`hotspot ${unlockedFlag ? 'hotspot-unlocked' : 'hotspot-locked'} ${isActive ? 'hotspot-active' : ''}`}
    />
  );
});

const WorldboundMap = React.memo(function WorldboundMap({ regions = [], onRegionClick = () => {}, recentlyUnlocked = null, activeRegionId = null }) {
  // regions are hotspots with lat/lng
  const processed = useMemo(() => {
    // compute normalized coords for each region and keep only validity info
    return regions.map(r => {
      const nc = normalizeCoords(r);
      return { ...r, latitude: nc.latitude, longitude: nc.longitude, coordValid: nc.valid };
    });
  }, [regions]);

  const center = useMemo(() => {
    const firstValid = processed.find(r => r.coordValid) || processed[0];
    if (!firstValid) return [20, 0];
    const lat = Number(firstValid.latitude);
    const lng = Number(firstValid.longitude);
    return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : [20, 0];
  }, [processed]);

  return (
    <div className="wb-map-card">
      <div className="map-header">
        <h3>Worldbound: The Living Map</h3>
        <p className="muted">Pan and zoom. Click a hotspot to reveal a memory.</p>
      </div>
      <div className="leaflet-wrap" style={{ height: 360, borderRadius: 10, overflow: 'hidden' }}>
        <MapContainer center={center} zoom={3} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {processed.map(h => {
            if (!h.coordValid) return null; // skip invalid coords silently
            return (
              <HotspotMarker
                key={h.id}
                id={h.id}
                latitude={h.latitude}
                longitude={h.longitude}
                isUnlocked={h.isUnlocked ?? h.unlocked}
                isActive={h.id === activeRegionId}
                onClick={onRegionClick}
              />
            );
          })}
        </MapContainer>
      </div>
      <div className="map-footer muted">Hotspots are tied to quests and persist across refreshes.</div>
    </div>
  );
});

export default WorldboundMap;
