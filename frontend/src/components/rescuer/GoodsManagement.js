import React, { useState, useEffect } from "react";
import axios from "axios";
import "./GoodsManagement.css"; // Using the same CSS as Offers for styling

const GoodsManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [baseLocation, setBaseLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [goods, setGoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedGood, setSelectedGood] = useState("");
  const [volume, setVolume] = useState(1);
  const [users, setUsers] = useState([]); // State to hold the list of users
  const [selectedUser, setSelectedUser] = useState(""); // State to hold the selected user ID
  const token = localStorage.getItem("token");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!token) throw new Error("No token found");

        const response = await axios.get("/api/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInventory(response.data.inventory);
        setUserLocation(response.data.location.coordinates);
        setUserId(response.data._id);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    const fetchBaseLocation = async () => {
      try {
        if (!token) throw new Error("No token found");

        const response = await axios.get("/api/base/location", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBaseLocation(response.data.location.coordinates);
      } catch (err) {
        console.error("Error fetching base location:", err);
      }
    };

    const fetchUsers = async () => {
      try {
        if (!token) throw new Error("No token found");

        const [tasksResponse, adminResponse] = await Promise.all([
          axios.get("/api/tasks", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("/api/users/admin", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const tasks = tasksResponse.data;
        const admin = adminResponse.data;
        const usersResponse = await axios.get("/api/users/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const acceptedTaskUserIds = tasks
          .filter((task) => task.acceptedBy === userId)
          .map((task) => task.issuedBy._id);

        const uniqueUserIds = [...new Set([admin._id, ...acceptedTaskUserIds])];

        const filteredUsers = usersResponse.data.filter((user) => {
          const [userLat, userLng] = user.location.coordinates;
          const distance =
            Math.sqrt(
              Math.pow(baseLocation[0] - userLat, 2) +
                Math.pow(baseLocation[1] - userLng, 2)
            ) * 111000;
          return uniqueUserIds.includes(user._id) && distance <= 100;
        });

        setUsers(filteredUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUserData();
    fetchBaseLocation();
    fetchUsers();
  }, [token, userId, baseLocation]);

  useEffect(() => {
    const fetchGoods = async () => {
      try {
        if (!token) throw new Error("No token found");

        if (selectedUser) {
          const response = await axios.get(
            `/api/emergency-goods/user/${selectedUser}/goods`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const fetchedGoods = response.data;
          setGoods(fetchedGoods);
          const categories = [
            ...new Set(fetchedGoods.map((good) => good.category)),
          ];
          setCategories(categories);
        } else {
          setGoods([]);
          setCategories([]);
        }
      } catch (err) {
        console.error("Error fetching goods:", err);
      }
    };

    fetchGoods();
  }, [selectedUser, token]);

  const handleLoadGoods = async (e) => {
    e.preventDefault();
    try {
      if (!token) throw new Error("No token found");

      const response = await axios.post(
        "/api/emergency-goods/rescuer/load",
        {
          rescuerId: userId,
          donorId: selectedUser, // Use the selected user ID
          category: selectedCategory,
          goodName: selectedGood,
          volume,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      alert("Goods loaded successfully");
      setInventory(response.data.inventory);
      setSelectedCategory("");
      setSelectedGood("");
      setVolume(1);
      setSelectedUser(""); // Reset selected user
    } catch (err) {
      console.error("Error loading goods:", err);
      alert("Error loading goods");
    }
  };

  const isWithinBaseRange = () => {
    if (!baseLocation || !userLocation) return false;
    const [baseLat, baseLng] = baseLocation;
    const [userLat, userLng] = userLocation;
    const distance =
      Math.sqrt(
        Math.pow(baseLat - userLat, 2) + Math.pow(baseLng - userLng, 2)
      ) * 111000;
    return distance <= 1000;
  };

  return (
    <div className="goods-management">
      <h2>Goods Management</h2>
      <div>
        <h3>Your Inventory</h3>
        <table>
          <thead>
            <tr>
              <th>Goods</th>
              <th>Volume</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((item) => (
              <tr key={item.name}>
                <td>{item.name}</td>
                <td>{item.volume}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isWithinBaseRange() && (
        <div className="load-goods">
          <h3>Load Goods from Base</h3>
          <form onSubmit={handleLoadGoods} className="load-goods-form">
            <div className="form-group">
              <label>Donor</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                required
              >
                <option value="">Select Donor</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                required
              >
                <option value="">Select Category</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Good</label>
              <select
                value={selectedGood}
                onChange={(e) => setSelectedGood(e.target.value)}
                required
              >
                <option value="">Select Good</option>
                {goods
                  .filter((good) => good.category === selectedCategory)
                  .map((good) => (
                    <option key={good._id} value={good.name}>
                      {good.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group">
              <label>Volume</label>
              <input
                type="number"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                min="1"
                max={goods.find((g) => g.name === selectedGood)?.volume || 1}
                required
              />
            </div>
            <button type="submit">Load Goods</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default GoodsManagement;
