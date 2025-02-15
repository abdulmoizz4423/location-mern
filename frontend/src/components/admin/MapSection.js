import React, { useState, useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";
import "./Map.css";

// Fix for default marker icon not displaying correctly
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Define custom icon for rescuers
const rescuerIcon = L.icon({
  iconUrl: "/rescuer.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

// Define custom icon for citizens
const citizenIcon = L.icon({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const DraggableMarker = ({ baseLocation, updateBaseLocation }) => {
  const [position, setPosition] = useState(baseLocation);
  const markerRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition([newPos.lat, newPos.lng]);
          console.log("Updating base location to:", [newPos.lat, newPos.lng]);
          updateBaseLocation([newPos.lat, newPos.lng]);
        }
      },
    }),
    [updateBaseLocation]
  );

  useEffect(() => {
    if (baseLocation && baseLocation.length === 2) {
      setPosition(baseLocation);
    }
  }, [baseLocation]);

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={L.icon({
        iconUrl: "/homemarker.png",
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      })}
    >
      <Popup>Base Location</Popup>
    </Marker>
  );
};

const MapSection = () => {
  const [baseLocation, setBaseLocation] = useState(null);
  const [rescuers, setRescuers] = useState([]);
  const [citizens, setCitizens] = useState([]);

  useEffect(() => {
    const fetchBaseLocation = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/base/location", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (
          response.data &&
          response.data.location &&
          response.data.location.coordinates &&
          response.data.location.coordinates.length === 2
        ) {
          setBaseLocation(response.data.location.coordinates);
        } else {
          //setBaseLocation([38.246639, 21.734574]); // Default location
        }
      } catch (err) {
        console.error("Error fetching base location", err);
        //setBaseLocation([38.246639, 21.734574]); // Default location on error
      }
    };
    fetchBaseLocation();
  }, []);

  useEffect(() => {
    const fetchRescuers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/rescuers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Fetched rescuers:", response.data);
        setRescuers(response.data);
      } catch (err) {
        console.error("Error fetching rescuers", err);
      }
    };
    fetchRescuers();
  }, []);

  useEffect(() => {
    const fetchCitizens = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/citizens", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Fetched users:", response.data);
        const citizenData = response.data.filter(
          (user) => user.role === "Citizen"
        );
        console.log("Filtered citizens:", citizenData);
        setCitizens(citizenData);
      } catch (err) {
        console.error("Error fetching citizens", err);
      }
    };
    fetchCitizens();
  }, []);

  const updateBaseLocation = async (newLocation) => {
    try {
      const token = localStorage.getItem("token");
      console.log("Saving new base location:", newLocation);
      await axios.put(
        "/api/base/location",
        { location: { coordinates: newLocation } },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBaseLocation(newLocation);
    } catch (err) {
      console.error("Error updating base location", err);
    }
  };

  useEffect(() => {
    console.log("Base location:", baseLocation);
    console.log("Rescuers:", rescuers);
    console.log("Citizens:", citizens);
  }, [baseLocation, rescuers, citizens]);

  if (!baseLocation) {
    return <div>Loading map...</div>;
  }

  return (
    <div className="map-panel">
      <MapContainer
        center={baseLocation}
        zoom={13}
        className="leaflet-container"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <DraggableMarker
          baseLocation={baseLocation}
          updateBaseLocation={updateBaseLocation}
        />
        {rescuers.map((rescuer) =>
          rescuer.location && rescuer.location.coordinates.length === 2 ? (
            <Marker
              key={rescuer._id}
              position={[
                rescuer.location.coordinates[0],
                rescuer.location.coordinates[1],
              ]}
              icon={rescuerIcon}
            >
              <Popup>
                <strong>Rescuer: {rescuer.username}</strong>
                <br />
                {rescuer.state}
              </Popup>
            </Marker>
          ) : null
        )}
        {citizens.map((citizen) =>
          citizen.location && citizen.location.coordinates.length === 2 ? (
            <Marker
              key={citizen._id}
              position={[
                citizen.location.coordinates[0],
                citizen.location.coordinates[1],
              ]}
              icon={citizenIcon}
            >
              <Popup>
                <strong>Citizen: {citizen.username}</strong>
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
};

export default MapSection;
