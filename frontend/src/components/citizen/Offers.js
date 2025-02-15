import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Requests.css";

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [userId, setUserId] = useState(null);
  const token = localStorage.getItem("token");

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

    const fetchOffers = async () => {
      try {
        const response = await axios.get("/api/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tasks = response.data;
        const availableOffers = tasks.filter(
          (task) => task.type === "offer" && task.issuedBy === null
        );
        setOffers(availableOffers);
      } catch (err) {
        console.error("Error fetching offers:", err);
      }
    };

    if (token) {
      fetchUserId();
      fetchOffers();
    }
  }, [token]);

  const handleAcceptOffer = async (taskId, goodsCategory, goods, volume) => {
    try {
      const dateTimeAccepted = new Date();

      // Update the task to reflect the citizen accepting the offer
      await axios.put(
        `/api/tasks/${taskId}`,
        {
          issuedBy: userId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Add the goods to the citizen's inventory
      await axios.post(
        "/api/emergency-goods/citizen/add",
        {
          userId,
          name: goods,
          category: goodsCategory,
          volume,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Add the task to the citizen's active tasks
      await axios.post(
        "/api/users/add-task",
        { userId, taskId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Offer accepted successfully!");

      // Refresh offers after accepting one
      const response = await axios.get("/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const tasks = response.data;
      const availableOffers = tasks.filter(
        (task) => task.type === "offer" && !task.acceptedBy
      );
      setOffers(availableOffers);
    } catch (err) {
      console.error("Error accepting offer:", err);
      alert("Error accepting offer");
    }
  };

  return (
    <div className="offers">
      <h2>Available Offers</h2>
      <table className="offers-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Goods</th>
            <th>Volume</th>
            <th>Date Issued</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => (
            <tr key={offer._id}>
              <td>{offer.goodsCategory}</td>
              <td>{offer.goods}</td>
              <td>{offer.volume}</td>
              <td>{new Date(offer.dateTimeIssued).toLocaleString()}</td>
              <td>
                <button
                  onClick={() =>
                    handleAcceptOffer(
                      offer._id,
                      offer.goodsCategory,
                      offer.goods,
                      offer.volume
                    )
                  }
                >
                  Accept
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Offers;
