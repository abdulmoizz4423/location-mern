import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import "./Requests.css";

const Requests = () => {
  const [goods, setGoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedGood, setSelectedGood] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const token = localStorage.getItem("token");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get("/api/users/current", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserId(response.data._id);
      } catch (err) {
        console.error("Error fetching user ID:", err);
      }
    };

    if (token) {
      fetchUserId();
    }
  }, [token]);

  useEffect(() => {
    const fetchGoods = async () => {
      try {
        const response = await axios.get("/api/emergency-goods", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGoods(response.data);
        const categories = [
          ...new Set(response.data.map((good) => good.category)),
        ];
        setCategories(categories);
      } catch (err) {
        console.error("Error fetching goods:", err);
      }
    };
    fetchGoods();
  }, [token]);

  const handleSearch = async (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.length > 2) {
      try {
        const response = await axios.get(
          `/api/emergency-goods/search?term=${e.target.value}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSearchResults(response.data);
      } catch (err) {
        console.error("Error fetching search results:", err);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectSearchResult = (result) => {
    setSelectedCategory(result.category);
    setSelectedGood(result.name);
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const taskResponse = await axios.post(
        "/api/tasks",
        {
          type: "request",
          goodsCategory: selectedCategory,
          goods: selectedGood,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update the task with the user ID as issuedBy
      await axios.put(
        `/api/tasks/${taskResponse.data._id}`,
        {
          issuedBy: userId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Add the task to the citizen's activeTasks list
      await axios.post(
        "/api/users/add-task",
        {
          userId,
          taskId: taskResponse.data._id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Request submitted successfully");
      setSelectedCategory("");
      setSelectedGood("");
    } catch (err) {
      console.error("Error submitting request:", err);
      alert("Error submitting request");
    }
  };

  return (
    <div className="requests">
      <h2>Issue Emergency Request</h2>
      <form onSubmit={handleSubmit} className="request-form">
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
        <div className="form-group search-group">
          <label>Or Search</label>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search for a good..."
          />
          <FaSearch className="search-icon" />
          {searchResults.length > 0 && (
            <ul className="search-results">
              {searchResults.map((result) => (
                <li
                  key={result._id}
                  onClick={() => handleSelectSearchResult(result)}
                >
                  {result.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
};

export default Requests;
