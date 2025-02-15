import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "./Sidebar";
import RescuerMap from "./RescuerMap";
import SearchAndSave from "./SearchAndSave";
import "./RescuerDashboard.css";

const GoodsManagement = lazy(() => import("./GoodsManagement"));
const TaskManagement = lazy(() => import("./TaskManagement"));

const RescuerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    navigate("/");
  }, [navigate]);

  const renderSection = useCallback(() => {
    switch (activeSection) {
      case "goods-management":
        return <GoodsManagement />;
      case "search-and-save":
        return <SearchAndSave userId={user?._id} />;
      case "task-management":
        return <TaskManagement />;
      case "logout":
        handleLogout();
        return null;
      default:
        return <h2>Welcome to the Rescuer Dashboard</h2>;
    }
  }, [activeSection, user?._id, handleLogout]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-layout">
      <Sidebar setActiveSection={setActiveSection} />
      <div className="dashboard-content">
        <h1>Welcome, {user.name}</h1>
        <Suspense fallback={<div>Loading...</div>}>{renderSection()}</Suspense>
      </div>
    </div>
  );
};

export default RescuerDashboard;
