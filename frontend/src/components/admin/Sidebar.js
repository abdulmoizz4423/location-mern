import React from "react";
import {
  FaHome,
  FaBox,
  FaUserPlus,
  FaBullhorn,
  FaMapMarkedAlt,
  FaChartBar,
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
        onClick={() => setActiveSection("goods")}
        title="Goods"
      >
        <FaBox size={20} />
      </div>
      <div
        className="sidebar-item"
        onClick={() => setActiveSection("rescuer")}
        title="Rescuer"
      >
        <FaUserPlus size={20} />
      </div>
      <div
        className="sidebar-item"
        onClick={() => setActiveSection("announcement")}
        title="Announcement"
      >
        <FaBullhorn size={20} />
      </div>
      <div
        className="sidebar-item"
        onClick={() => setActiveSection("map")}
        title="Map"
      >
        <FaMapMarkedAlt size={20} />
      </div>
      <div
        className="sidebar-item"
        onClick={() => setActiveSection("statistics")}
        title="Statistics"
      >
        <FaChartBar size={20} />
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
