import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import "./Map.css";

// Fix for default marker icon not displaying correctly
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Define custom icon for citizens
const citizenIcon = L.icon({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const RescuerMarker = ({ rescuerLocation, updateRescuerLocation }) => {
  const [position, setPosition] = React.useState(rescuerLocation);
  const markerRef = React.useRef(null);

  const eventHandlers = React.useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition([newPos.lat, newPos.lng]);
          console.log("Updating rescuer location to:", [
            newPos.lat,
            newPos.lng,
          ]);
          updateRescuerLocation([newPos.lat, newPos.lng]);
        }
      },
    }),
    [updateRescuerLocation]
  );

  React.useEffect(() => {
    if (rescuerLocation && rescuerLocation.length === 2) {
      setPosition(rescuerLocation);
    }
  }, [rescuerLocation]);

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={L.icon({
        iconUrl: "/rescuer.png",
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      })}
    >
      <Popup>Your Location</Popup>
    </Marker>
  );
};

const RescuerMap = ({
  baseLocation,
  rescuer,
  citizens,
  updateRescuerLocation,
  setRescuer, // Accept setRescuer here
}) => {
  const [taskDetails, setTaskDetails] = useState({});
  const [isTaskDetailsLoaded, setIsTaskDetailsLoaded] = useState(false);

  useEffect(() => {
    const fetchAllTaskDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const taskIds = citizens.flatMap((citizen) => citizen.activeTasks);
        const uniqueTaskIds = [...new Set(taskIds)];

        const taskDetailPromises = uniqueTaskIds.map((taskId) =>
          axios.get(`/api/tasks/${taskId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        );

        const taskDetailResponses = await Promise.all(taskDetailPromises);

        const taskDetailsMap = taskDetailResponses.reduce((acc, response) => {
          acc[response.data._id] = response.data;
          return acc;
        }, {});

        setTaskDetails(taskDetailsMap);
        setIsTaskDetailsLoaded(true);
      } catch (err) {
        console.error("Error fetching task details:", err);
      }
    };

    fetchAllTaskDetails();
  }, [citizens]);

  const handleMarkerAccept = async (task) => {
    try {
      const token = localStorage.getItem("token");
      // Update the task with acceptedBy and dateTimeAccepted
      await axios.put(
        `/api/tasks/${task._id}`,
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
          taskId: task._id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRescuer((prevRescuer) => ({
        ...prevRescuer,
        activeTasks: [...prevRescuer.activeTasks, task._id],
      }));
      // Update the taskDetails to mark it as accepted
      setTaskDetails((prevDetails) => ({
        ...prevDetails,
        [task._id]: { ...prevDetails[task._id], acceptedBy: rescuer._id },
      }));
    } catch (err) {
      console.error("Error accepting task:", err);
    }
  };

  if (!baseLocation || !rescuer || !isTaskDetailsLoaded) {
    return <div>Loading map...</div>;
  }

  // Filter citizens
  console.log("Citizens:", citizens);
  const filteredCitizens = citizens.filter((citizen) => {
    console.log("Processing Citizen:", citizen);
    const result = citizen.activeTasks.every((taskId) => {
      const taskDetail = taskDetails[taskId];
      // Skip filtering if taskDetails are not yet available
      if (!taskDetail) {
        console.log(
          `Skipping task ${taskId} for citizen ${citizen._id} because task details are not available yet.`
        );
        return false;
      }
      console.log("Task ID:", taskId, "Details:", taskDetail);
      const filterResult =
        !taskDetail.acceptedBy || taskDetail.acceptedBy === rescuer._id;
      console.log("Filter result for task:", filterResult);
      return filterResult;
    });
    console.log("Filter result for citizen:", result);
    return result;
  });

  console.log("Filtered Citizens:", filteredCitizens);

  return (
    <div className="map-panel">
      <MapContainer
        center={baseLocation}
        zoom={13}
        className="leaflet-container"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker
          position={baseLocation}
          icon={L.icon({
            iconUrl: "/homemarker.png",
            iconSize: [30, 30],
            iconAnchor: [15, 30],
          })}
        >
          <Popup>Base Location</Popup>
        </Marker>
        <RescuerMarker
          rescuerLocation={rescuer.location.coordinates}
          updateRescuerLocation={updateRescuerLocation}
        />
        {filteredCitizens.map((citizen) =>
          citizen.location && citizen.location.coordinates.length === 2 ? (
            <Marker
              key={citizen._id}
              position={[
                citizen.location.coordinates[0],
                citizen.location.coordinates[1],
              ]}
              icon={citizenIcon}
            >
              <Popup minWidth={300}>
                <strong>Citizen: {citizen.username}</strong>
                <br />
                <table>
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Goods Category</th>
                      <th>Goods</th>
                      <th>Volume</th>
                      <th>Accept</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citizen.activeTasks.map((taskId) => (
                      <tr key={taskId}>
                        {taskDetails[taskId] ? (
                          <>
                            <td>{taskDetails[taskId].type}</td>
                            <td>{taskDetails[taskId].goodsCategory}</td>
                            <td>{taskDetails[taskId].goods}</td>
                            <td>{taskDetails[taskId].volume}</td>
                            <td>
                              <button
                                onClick={() =>
                                  handleMarkerAccept(taskDetails[taskId])
                                }
                                disabled={
                                  (taskDetails[taskId].acceptedBy &&
                                    taskDetails[taskId].acceptedBy !==
                                      rescuer._id) ||
                                  rescuer.activeTasks.length >= 4
                                }
                              >
                                Accept
                              </button>
                            </td>
                          </>
                        ) : (
                          <td colSpan={5}>Loading task details...</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
};

export default RescuerMap;
