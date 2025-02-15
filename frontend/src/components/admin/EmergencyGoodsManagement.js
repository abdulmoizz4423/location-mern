import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import "./EmergencyGoodsManagement.css";

const EmergencyGoodsManagement = React.memo(({ goods, setGoods }) => {
  const [newGood, setNewGood] = useState({ name: "", category: "", volume: 1 });
  const [emergencyGoods, setEmergencyGoods] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/users/current", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserId(response.data._id);
      } catch (err) {
        console.error("Error fetching user ID:", err);
      }
    };

    fetchUserId();
  }, []);

  const handleAddGood = useCallback(async () => {
    if (newGood.name && newGood.category && newGood.volume) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          "/api/emergency-goods/admin/add",
          newGood,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setGoods((prevGoods) => [
          ...prevGoods,
          { ...newGood, _id: response.data._id },
        ]);
        setNewGood({ name: "", category: "", volume: 1 });
      } catch (err) {
        console.error(err);
      }
    }
  }, [newGood, setGoods]);

  const handleRemoveGood = useCallback(
    async (good) => {
      try {
        const token = localStorage.getItem("token");
        await axios.delete("/api/emergency-goods/admin/remove", {
          headers: { Authorization: `Bearer ${token}` },
          data: {
            name: good.name,
            category: good.category,
            volume: good.volume,
          },
        });
        setGoods((prevGoods) => prevGoods.filter((g) => g._id !== good._id));
      } catch (err) {
        console.error(err);
      }
    },
    [setGoods]
  );

  useEffect(() => {
    const fetchGoods = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `/api/emergency-goods/user/${userId}/goods`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setGoods(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (userId) {
      fetchGoods();
    }
  }, [userId, setGoods]);

  useEffect(() => {
    const fetchEmergencyGoods = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/emergency-goods", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmergencyGoods(response.data);
      } catch (err) {
        console.error("Error fetching emergency goods:", err);
      }
    };

    fetchEmergencyGoods();
  }, []);

  return (
    <div className="section">
      <h2>Emergency Goods Management</h2>
      <div className="form-group">
        <input
          type="text"
          placeholder="Category"
          value={newGood.category}
          onChange={(e) => setNewGood({ ...newGood, category: e.target.value })}
        />
        <input
          type="text"
          placeholder="Good"
          value={newGood.name}
          onChange={(e) => setNewGood({ ...newGood, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Volume"
          value={newGood.volume}
          onChange={(e) =>
            setNewGood({ ...newGood, volume: parseInt(e.target.value) })
          }
        />
        <button onClick={handleAddGood}>Add</button>
      </div>
      <h3>Inventory</h3>
      <table className="aligned-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Good</th>
            <th>Volume</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {goods.map((good) => (
            <tr key={good._id}>
              <td>{good.category}</td>
              <td>{good.name}</td>
              <td>{good.volume}</td>
              <td>
                <button onClick={() => handleRemoveGood(good)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3>Possible Goods</h3>
      <table className="aligned-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Good</th>
            <th></th> {/* Empty header to align with the above table */}
            <th></th> {/* Empty header to align with the above table */}
          </tr>
        </thead>
        <tbody>
          {emergencyGoods.map((good) => (
            <tr key={good._id}>
              <td>{good.category}</td>
              <td>{good.name}</td>
              <td></td> {/* Empty cell to align with the above table */}
              <td></td> {/* Empty cell to align with the above table */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default EmergencyGoodsManagement;
