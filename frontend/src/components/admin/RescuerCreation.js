import React, { useState, useEffect } from "react";
import axios from "axios";

const RescuerCreation = () => {
  const [rescuerData, setRescuerData] = useState({
    username: "",
    password: "",
  });
  const [rescuers, setRescuers] = useState([]);

  useEffect(() => {
    const fetchRescuers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/rescuers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRescuers(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRescuers();
  }, []);

  const handleAddRescuer = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/rescuers/create",
        {
          ...rescuerData,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRescuers((prevRescuers) => [...prevRescuers, response.data]);
      setRescuerData({ username: "", password: "" });
      alert("Rescuer created successfully");
    } catch (err) {
      alert("Error creating rescuer");
      console.error("Error creating rescuer:", err); // Log the error for debugging
    }
  };

  return (
    <div className="section rescuer-creation">
      <h2>Create Rescuer Account</h2>
      <form onSubmit={handleAddRescuer}>
        <input
          type="text"
          placeholder="Username"
          value={rescuerData.username}
          onChange={(e) =>
            setRescuerData({ ...rescuerData, username: e.target.value })
          }
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={rescuerData.password}
          onChange={(e) =>
            setRescuerData({ ...rescuerData, password: e.target.value })
          }
          required
        />
        <button type="submit">Create Rescuer</button>
      </form>
      <h2>Rescuers List</h2>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>State</th>
            <th>Inventory</th>
          </tr>
        </thead>
        <tbody>
          {rescuers.map((rescuer) => (
            <tr key={rescuer._id}>
              <td>{rescuer.username}</td>
              <td>{rescuer.state}</td>
              <td>
                {rescuer.inventory && rescuer.inventory.length > 0 ? (
                  <ul>
                    {rescuer.inventory.map((item) => (
                      <li key={item._id}>
                        {item.name} (Volume: {item.volume})
                      </li>
                    ))}
                  </ul>
                ) : (
                  "No items"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RescuerCreation;
