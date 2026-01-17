import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// 🔵 Blue icon for user location
const userLocationIcon = new L.Icon({
    iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});
// 🔴 Red icon for nearby places
const placeIcon = new L.Icon({
    iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// 🔴 Fix default Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function FitBounds({ userLocation, places }) {
    const map = useMap();

    useEffect(() => {
        if (!userLocation) return;

        const bounds = [];

        // user location
        bounds.push([userLocation.lat, userLocation.lon]);

        // nearby places
        places.forEach((p) => {
            const lat = p.lat ?? p.center?.lat;
            const lon = p.lon ?? p.center?.lon;
            if (lat && lon) bounds.push([lat, lon]);
        });

        if (bounds.length > 1) {
            map.fitBounds(bounds, { padding: [50, 50] });
        } else {
            map.setView([userLocation.lat, userLocation.lon], 14);
        }
    }, [userLocation, places, map]);

    return null;
}

export default function EmergencyMap({ userLocation, places }) {
    if (!userLocation) return null;

    return (
        <MapContainer
            center={[userLocation.lat, userLocation.lon]}
            zoom={14}
            style={{ height: "500px", width: "100%", borderRadius: "12px" }}
        >
            <TileLayer
                attribution="© OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds userLocation={userLocation} places={places} />
            {/* 🔵 User location marker */}
            <Marker
                position={[userLocation.lat, userLocation.lon]}
                icon={userLocationIcon}
            >
                <Popup>
                    <strong>You are here</strong>
                </Popup>
            </Marker>

            {/* 🔴 Nearby places */}
            {places.map((p) => {
                const lat = p.lat ?? p.center?.lat;
                const lon = p.lon ?? p.center?.lon;
                if (!lat || !lon) return null;

                return (
                    <Marker
                        key={p.id}
                        position={[lat, lon]}
                        icon={placeIcon}
                    >
                        <Popup>
                            <strong>{p.tags?.name || "Unnamed place"}</strong>
                            <br />
                            {p.tags?.amenity}
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}
