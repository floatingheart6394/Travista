import React, { useMemo, useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, useMap } from "react-leaflet";
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

  // User location state (local only, not persisted)
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // Request location once on mount
  useEffect(() => {
    if (!navigator || !navigator.geolocation) {
      setLocationError("Geolocation unavailable");
      return;
    }
    let mounted = true;
    try {
      navigator.geolocation.getCurrentPosition(
        pos => {
          if (!mounted) return;
          const lat = Number(pos.coords.latitude);
          const lng = Number(pos.coords.longitude);
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            setUserLocation({ latitude: lat, longitude: lng });
          } else {
            setLocationError("Invalid coordinates");
          }
        },
        err => {
          if (!mounted) return;
          setLocationError(err && err.message ? String(err.message) : "Permission denied or unavailable");
        },
        { enableHighAccuracy: false, maximumAge: 60 * 1000, timeout: 5000 }
      );
    } catch (e) {
      setLocationError("Geolocation error");
    }
    return () => { mounted = false; };
  }, []);

  // Component to set view once when userLocation first appears
  function CenterOnceOnLocation({ loc }) {
    const map = useMap();
    const doneRef = useRef(false);
    useEffect(() => {
      if (!doneRef.current && loc && map) {
        const lat = Number(loc.latitude);
        const lng = Number(loc.longitude);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          try { map.setView([lat, lng], Math.max(map.getZoom(), 6)); } catch (e) { /* ignore */ }
          doneRef.current = true;
        }
      }
    }, [loc, map]);
    return null;
  }

  return (
    <div className="wb-map-card">
      <div className="map-header">
        <h3>Worldbound: The Living Map</h3>
        <p className="muted">Pan and zoom. Click a hotspot to reveal a memory.</p>
      </div>
      <div className="leaflet-wrap" style={{ height: 360, borderRadius: 10, overflow: 'hidden' }}>
        <MapContainer center={center} zoom={3} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }} whenCreated={map => { /* no-op to ensure map mounts */ }}>
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
          {/* Render user location marker if available and valid */}
          {userLocation && Number.isFinite(userLocation.latitude) && Number.isFinite(userLocation.longitude) ? (
            <CircleMarker
              center={[userLocation.latitude, userLocation.longitude]}
              radius={6}
              pathOptions={{ color: '#e07a5f', fillColor: '#e07a5f', fillOpacity: 0.9 }}
              className="user-location-marker"
            />
          ) : null}
          {/* Center map once on initial user location */}
          {userLocation ? <CenterOnceOnLocation loc={userLocation} /> : null}
        </MapContainer>
      </div>
      <div className="map-footer muted">Hotspots are tied to quests and persist across refreshes.</div>
    </div>
  );
});

export default WorldboundMap;
