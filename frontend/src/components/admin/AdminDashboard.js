import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import "./AdminDashboard.css";

// Lazy load components
const EmergencyGoodsManagement = lazy(() =>
  import("./EmergencyGoodsManagement")
);
const RescuerCreation = lazy(() => import("./RescuerCreation"));
const AnnouncementCreation = lazy(() => import("./AnnouncementCreation"));
const StatisticsSection = lazy(() => import("./StatisticsSection"));
const StorageTable = lazy(() => import("./StorageTable"));
const MapSection = lazy(() => import("./MapSection"));

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [goods, setGoods] = useState([]);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const fetchGoods = async () => {
      try {
        const response = await axios.get("/api/emergency-goods");
        setGoods(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGoods();
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    navigate("/");
  }, [navigate]);

  const renderSection = useCallback(() => {
    switch (activeSection) {
      case "goods":
        return <EmergencyGoodsManagement goods={goods} setGoods={setGoods} />;
      case "rescuer":
        return <RescuerCreation />;
      case "announcement":
        return <AnnouncementCreation />;
      case "map":
        return <MapSection />;
      case "statistics":
        return <StatisticsSection />;
      case "storage":
        return <StorageTable />;
      case "logout":
        handleLogout();
        return null;
      default:
        return <h2>Welcome to the Admin Dashboard</h2>;
    }
  }, [activeSection, goods, setGoods, handleLogout]);

  return (
    <div className="dashboard-layout">
      <Sidebar setActiveSection={setActiveSection} />
      <div className="dashboard-content">
        <Suspense fallback={<div>Loading...</div>}>{renderSection()}</Suspense>
      </div>
    </div>
  );
};

export default AdminDashboard;
