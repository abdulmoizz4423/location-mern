import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import MapModal from "./MapModal";
import Home from "./Home"; // Import Home component
import "./CitizenDashboard.css";

// Lazy load components
const Requests = lazy(() => import("./Requests"));
const Offers = lazy(() => import("./Offers"));
const TaskTable = lazy(() => import("./TaskTable"));

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        if (
          !response.data.location ||
          response.data.location.coordinates[0] === null ||
          response.data.location.coordinates[1] === null
        ) {
          setShowMapModal(true);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUser();
  }, []);

  const handleSaveLocation = async (newLocation) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "/api/auth/set-location",
        { location: { type: "Point", coordinates: newLocation } },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUser((prevUser) => ({
        ...prevUser,
        location: { type: "Point", coordinates: newLocation },
      }));
      setShowMapModal(false);
    } catch (err) {
      console.error("Error saving location:", err);
    }
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    navigate("/");
  }, [navigate]);

  const renderSection = useCallback(() => {
    switch (activeSection) {
      case "requests":
        return <Requests />;
      case "offers":
        return <Offers />;
      case "tasks":
        return <TaskTable />;
      case "home":
        return <Home />; // Render Home component
      case "logout":
        handleLogout();
        return null;
      default:
        return <Home />; // Set Home as the default component
    }
  }, [activeSection, handleLogout]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar setActiveSection={setActiveSection} />
      <div className="dashboard-content">
        <h1>Welcome, {user.name}</h1>
        <p>
          Your current location is:{" "}
          {user.location && user.location.coordinates[0] !== null
            ? user.location.coordinates.join(", ")
            : "Not set"}
        </p>
        {showMapModal && (
          <MapModal userId={user._id} onSaveLocation={handleSaveLocation} />
        )}
        <Suspense fallback={<div>Loading...</div>}>{renderSection()}</Suspense>
      </div>
    </div>
  );
};

export default CitizenDashboard;
