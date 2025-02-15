import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Home.css";

const Home = () => {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Filter tasks to show only those issued by admin and not accepted
        const filteredAnnouncements = response.data.filter(
          (task) => !task.issuedBy
        );
        setAnnouncements(filteredAnnouncements);
      } catch (err) {
        console.error("Error fetching announcements:", err);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <div className="home">
      <h2>Announcements</h2>
      <table className="announcement-table">
        <thead>
          <tr>
            <th>Task Type</th>
            <th>Goods Category</th>
            <th>Goods</th>
            <th>Date Issued</th>
          </tr>
        </thead>
        <tbody>
          {announcements.map((announcement) => (
            <tr key={announcement._id}>
              <td>{announcement.type}</td> {/* Task type column */}
              <td>{announcement.goodsCategory}</td>
              <td>{announcement.goods}</td>
              <td>{new Date(announcement.dateTimeIssued).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Home;
