import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  Circle,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";
import "./MapModal.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const MapModal = ({ userId, onSaveLocation }) => {
  const [baseLocation, setBaseLocation] = useState([38.246639, 21.734574]);
  const [markerPosition, setMarkerPosition] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchBaseLocation = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/users/base", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (
          response.data &&
          response.data.location &&
          response.data.location.coordinates
        ) {
          setBaseLocation(response.data.location.coordinates);
        }
      } catch (err) {
        console.error("Error fetching base location", err);
      }
    };
    fetchBaseLocation();
  }, []);

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    const distance = getDistanceFromLatLonInKm(
      baseLocation[0],
      baseLocation[1],
      lat,
      lng
    );

    if (distance <= 5) {
      setMarkerPosition([lat, lng]);
    } else {
      alert("Location must be within 5km of the base.");
    }
  };

  const handleSaveLocation = async () => {
    if (!markerPosition) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/api/auth/set-location`,
        {
          location: { type: "Point", coordinates: markerPosition },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      onSaveLocation(markerPosition);
    } catch (err) {
      console.error("Error saving location:", err);
    }
  };

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1); // deg2rad below
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  return (
    <div className="map-modal">
      <div className="map-container">
        <MapContainer
          center={baseLocation}
          zoom={13}
          className="leaflet-container"
          whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker
            position={baseLocation}
            icon={L.icon({
              iconUrl: "/homemarker.png",
              iconSize: [30, 30],
              iconAnchor: [15, 30],
            })}
          >
            <Popup>Base Location</Popup>
          </Marker>
          {markerPosition && (
            <Marker
              position={markerPosition}
              icon={L.icon({
                iconUrl:
                  "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
              })}
            >
              <Popup>
                <button onClick={handleSaveLocation}>Confirm Location</button>
              </Popup>
            </Marker>
          )}
          <MapClickHandler />
          <Circle
            center={baseLocation}
            radius={5000}
            color="red"
            fillColor="#f03"
            fillOpacity={0.1}
          />
        </MapContainer>
      </div>
    </div>
  );
};

export default MapModal;
