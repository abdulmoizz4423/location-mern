import React, { useState, useEffect } from "react";
import axios from "axios";
import "./TaskTable.css"; // You can create and style this CSS file as needed

const TaskTable = () => {
  const [requests, setRequests] = useState([]);
  const [offers, setOffers] = useState([]);
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
    const fetchTasks = async () => {
      try {
        const response = await axios.get("/api/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const tasks = response.data;
        const userRequests = tasks.filter(
          (task) => task.type === "request" && task.issuedBy?._id === userId
        );
        const userOffers = tasks.filter(
          (task) => task.type === "offer" && task.issuedBy?._id === userId
        );

        setRequests(userRequests);
        setOffers(userOffers);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      }
    };

    if (userId) {
      fetchTasks();
    }
  }, [token, userId]);

  const handleCancelOffer = async (taskId, goodsCategory, goods, volume) => {
    try {
      // Update the task to set issuedBy to null
      await axios.put(
        `/api/tasks/${taskId}`,
        { issuedBy: null },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove the task from the user's active tasks
      await axios.post(
        "/api/users/remove-task",
        {
          userId,
          taskId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update the user's inventory
      const response = await axios.get(`/api/users/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.inventory) {
        const inventory = response.data.inventory;
        const itemIndex = inventory.findIndex(
          (item) => item.name === goods && item.category === goodsCategory
        );

        if (itemIndex !== -1) {
          const item = inventory[itemIndex];
          const newVolume = item.volume - volume;

          if (newVolume < 0) {
            throw new Error("Negative quantity not allowed");
          } else if (newVolume === 0) {
            inventory.splice(itemIndex, 1);
          } else {
            inventory[itemIndex].volume = newVolume;
          }

          await axios.put(
            `/api/users/${userId}/inventory`,
            { inventory },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }

      setOffers((prevOffers) =>
        prevOffers.filter((offer) => offer._id !== taskId)
      );
    } catch (err) {
      console.error("Error cancelling offer:", err);
      alert("Error cancelling offer");
    }
  };

  const handleCancelRequest = async (taskId) => {
    try {
      // Update the task to set issuedBy to null
      await axios.put(
        `/api/tasks/${taskId}`,
        { issuedBy: null },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove the task from the user's active tasks
      await axios.post(
        "/api/users/remove-task",
        {
          userId,
          taskId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRequests((prevRequests) =>
        prevRequests.filter((request) => request._id !== taskId)
      );
    } catch (err) {
      console.error("Error cancelling request:", err);
      alert("Error cancelling request");
    }
  };

  const renderTasks = (tasks, isOffer) => {
    return tasks.map((task) => (
      <tr key={task._id}>
        <td>{task.goodsCategory}</td>
        <td>{task.goods}</td>
        <td>{task.volume}</td>
        <td>{new Date(task.dateTimeIssued).toLocaleString()}</td>
        <td>
          {task.dateTimeAccepted
            ? new Date(task.dateTimeAccepted).toLocaleString()
            : "Not accepted"}
        </td>
        <td>
          {task.dateTimeCompleted
            ? new Date(task.dateTimeCompleted).toLocaleString()
            : "Not completed"}
        </td>
        <td>
          <button
            onClick={() =>
              isOffer
                ? handleCancelOffer(
                    task._id,
                    task.goodsCategory,
                    task.goods,
                    task.volume
                  )
                : handleCancelRequest(task._id)
            }
          >
            Cancel
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <div>
      <h2>My Tasks</h2>
      <h3>My Requests</h3>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Goods</th>
            <th>Volume</th>
            <th>Date Issued</th>
            <th>Date Accepted</th>
            <th>Date Completed</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>{renderTasks(requests, false)}</tbody>
      </table>
      <h3>My Offers</h3>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Goods</th>
            <th>Volume</th>
            <th>Date Issued</th>
            <th>Date Accepted</th>
            <th>Date Completed</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>{renderTasks(offers, true)}</tbody>
      </table>
    </div>
  );
};

export default TaskTable;
