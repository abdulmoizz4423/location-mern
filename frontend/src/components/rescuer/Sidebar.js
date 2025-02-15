import React from "react";
import {
  FaHome,
  FaBox,
  FaMapMarkedAlt,
  FaTasks,
  FaSignOutAlt,
} from "react-icons/fa";
import "./Sidebar.css";

const Sidebar = ({ setActiveSection }) => {
  return (
    <div className="sidebar">
      <div
        className="sidebar-item"
        onClick={() => setActiveSection("home")}
        title="Home"
      >
        <FaHome size={20} />
      </div>
      <div
        className="sidebar-item"
        onClick={() => setActiveSection("goods-management")}
        title="Goods Management"
      >
        <FaBox size={20} />
      </div>
      <div
        className="sidebar-item"
        onClick={() => setActiveSection("search-and-save")}
        title="Search & Save"
      >
        <FaMapMarkedAlt size={20} />
      </div>
      <div
        className="sidebar-item"
        onClick={() => setActiveSection("task-management")}
        title="Task Management"
      >
        <FaTasks size={20} />
      </div>
      <div
        className="sidebar-item"
        onClick={() => setActiveSection("logout")}
        title="Logout"
      >
        <FaSignOutAlt size={20} />
      </div>
    </div>
  );
};

export default Sidebar;
