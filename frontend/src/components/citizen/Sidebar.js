import React from "react";
import {
  FaHome,
  FaBox,
  FaUserPlus,
  FaBullhorn,
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
        onClick={() => setActiveSection("requests")}
        title="Requests"
      >
        <FaBox size={20} />
      </div>
      <div
        className="sidebar-item"
        onClick={() => setActiveSection("offers")}
        title="Offers"
      >
        <FaUserPlus size={20} />
      </div>
      <div
        className="sidebar-item"
        onClick={() => setActiveSection("tasks")}
        title="Tasks"
      >
        <FaBullhorn size={20} />
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
