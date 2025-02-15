import React, { useState, useEffect } from "react";
import axios from "axios";
import RescuerMap from "./RescuerMap";
import MapTaskAccept from "./MapTaskAccept";
import "./Map.css";

const SearchAndSave = () => {
  const [baseLocation, setBaseLocation] = useState(null);
  const [rescuer, setRescuer] = useState(null);
  const [citizens, setCitizens] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchBaseLocation = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/base/location", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data?.location?.coordinates) {
          setBaseLocation(response.data.location.coordinates);
        }
      } catch (err) {
        console.error("Error fetching base location", err);
      }
    };

    const fetchRescuer = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRescuer(response.data);
      } catch (err) {
        console.error("Error fetching rescuer data", err);
      }
    };

    const fetchCitizens = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/citizens", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Filter citizens based on the tasks conditions
        const filteredCitizens = response.data.filter(
          (citizen) =>
            (citizen.activeTasks.length === 0 ||
              citizen.activeTasks.some((task) => !task.acceptedBy)) &&
            citizen.location &&
            citizen.location.coordinates.length === 2
        );
        setCitizens(filteredCitizens);
      } catch (err) {
        console.error("Error fetching citizens", err);
      }
    };

    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(response.data);
      } catch (err) {
        console.error("Error fetching tasks", err);
      }
    };

    fetchBaseLocation();
    fetchRescuer();
    fetchCitizens();
    fetchTasks();
  }, []);

  const handleAcceptTask = async (taskId) => {
    try {
      const token = localStorage.getItem("token");
      // Update the task with acceptedBy and dateTimeAccepted
      await axios.put(
        `/api/tasks/${taskId}`,
        {
          acceptedBy: rescuer._id,
          dateTimeAccepted: new Date(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Add the task to the rescuer's activeTasks
      await axios.post(
        "/api/rescuers/add-task",
        {
          userId: rescuer._id,
          taskId: taskId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRescuer((prevRescuer) => ({
        ...prevRescuer,
        activeTasks: [...prevRescuer.activeTasks, taskId],
      }));
      // Remove the task from the list of available tasks
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    } catch (err) {
      console.error("Error accepting task:", err);
    }
  };

  const updateRescuerLocation = async (newLocation) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "/api/users/set-location",
        {
          location: { type: "Point", coordinates: newLocation },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRescuer((prevRescuer) => ({
        ...prevRescuer,
        location: { type: "Point", coordinates: newLocation },
      }));
    } catch (err) {
      console.error("Error updating rescuer location", err);
    }
  };

  const handleMarkerAccept = (task) => {
    if (window.confirm(`Do you want to accept the task: ${task.goods}?`)) {
      handleAcceptTask(task._id);
    }
  };

  return (
    <div>
      <h2>Search & Save</h2>
      <RescuerMap
        baseLocation={baseLocation}
        rescuer={rescuer}
        citizens={citizens}
        updateRescuerLocation={updateRescuerLocation}
        handleMarkerAccept={handleMarkerAccept}
        setRescuer={setRescuer} // Pass setRescuer here
      />
      <MapTaskAccept
        tasks={tasks}
        rescuer={rescuer}
        handleAcceptTask={handleAcceptTask}
      />
    </div>
  );
};

export default SearchAndSave;
