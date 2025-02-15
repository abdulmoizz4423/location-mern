import React, { useState, useEffect } from "react";
import axios from "axios";

const AnnouncementCreation = () => {
  const [announcementData, setAnnouncementData] = useState({
    goodsCategory: "",
    goods: "",
    volume: 0,
    type: "offer",
    issuedBy: null,
  });
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAnnouncementData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/tasks", announcementData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Announcement created successfully");
      setAnnouncementData({
        goodsCategory: "",
        goods: "",
        volume: 0,
        type: "offer",
        issuedBy: null,
      });
      fetchAnnouncements(); // Refresh announcements list
    } catch (err) {
      console.error("Error creating announcement:", err);
      alert("Error creating announcement");
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Announcement deleted successfully");
      fetchAnnouncements(); // Refresh announcements list
    } catch (err) {
      console.error("Error deleting announcement:", err);
      alert("Error deleting announcement");
    }
  };

  return (
    <div className="section">
      <h2>Create Announcement</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="goodsCategory"
          placeholder="Goods Category"
          value={announcementData.goodsCategory}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="goods"
          placeholder="Goods"
          value={announcementData.goods}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="volume"
          placeholder="Volume"
          value={announcementData.volume}
          onChange={handleChange}
          min="0"
        />
        <button type="submit">Create Announcement</button>
      </form>

      <h2>Announcements</h2>
      <table>
        <thead>
          <tr>
            <th>Goods Category</th>
            <th>Goods</th>
            <th>Date Issued</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {announcements.map((announcement) => (
            <tr key={announcement._id}>
              <td>{announcement.goodsCategory}</td>
              <td>{announcement.goods}</td>
              <td>{new Date(announcement.dateTimeIssued).toLocaleString()}</td>
              <td>
                <button onClick={() => handleDelete(announcement._id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AnnouncementCreation;
