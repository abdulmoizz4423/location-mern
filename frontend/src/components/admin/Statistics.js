import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Register necessary components and scales
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Statistics = () => {
  const [tasks, setTasks] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filteredData, setFilteredData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filterData = () => {
      const filteredTasks = tasks.filter((task) => {
        const issuedDate = new Date(task.dateTimeIssued);
        const isIssuerCitizen = task.issuedBy !== null;
        return (
          isIssuerCitizen &&
          (!startDate || issuedDate >= startDate) &&
          (!endDate || issuedDate <= endDate)
        );
      });

      const labels = [
        ...new Set(
          filteredTasks.map((task) =>
            new Date(task.dateTimeIssued).toLocaleDateString()
          )
        ),
      ];
      const offers = labels.map(
        (label) =>
          filteredTasks.filter(
            (task) =>
              task.type === "offer" &&
              new Date(task.dateTimeIssued).toLocaleDateString() === label
          ).length
      );
      const requests = labels.map(
        (label) =>
          filteredTasks.filter(
            (task) =>
              task.type === "request" &&
              new Date(task.dateTimeIssued).toLocaleDateString() === label
          ).length
      );
      const completedOffers = labels.map(
        (label) =>
          filteredTasks.filter(
            (task) =>
              task.type === "offer" &&
              task.dateTimeCompleted &&
              new Date(task.dateTimeIssued).toLocaleDateString() === label
          ).length
      );
      const completedRequests = labels.map(
        (label) =>
          filteredTasks.filter(
            (task) =>
              task.type === "request" &&
              task.dateTimeCompleted &&
              new Date(task.dateTimeIssued).toLocaleDateString() === label
          ).length
      );

      setFilteredData({
        labels,
        datasets: [
          {
            label: "Offers",
            backgroundColor: "rgba(75,192,192,0.4)",
            borderColor: "rgba(75,192,192,1)",
            borderWidth: 1,
            data: offers,
          },
          {
            label: "Requests",
            backgroundColor: "rgba(192,75,75,0.4)",
            borderColor: "rgba(192,75,75,1)",
            borderWidth: 1,
            data: requests,
          },
          {
            label: "Completed Offers",
            backgroundColor: "rgba(75,192,75,0.4)",
            borderColor: "rgba(75,192,75,1)",
            borderWidth: 1,
            data: completedOffers,
          },
          {
            label: "Completed Requests",
            backgroundColor: "rgba(75,75,192,0.4)",
            borderColor: "rgba(75,75,192,1)",
            borderWidth: 1,
            data: completedRequests,
          },
        ],
      });
    };

    filterData();
  }, [tasks, startDate, endDate]);

  return (
    <div className="statistics-container">
      <div className="filters">
        <div className="date-picker">
          <label>Start Date: </label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            isClearable
            placeholderText="Select start date"
          />
        </div>
        <div className="date-picker">
          <label>End Date: </label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            isClearable
            placeholderText="Select end date"
          />
        </div>
      </div>
      <div className="chart-container">
        <Line
          data={filteredData}
          options={{
            maintainAspectRatio: false,
            responsive: true,
            scales: {
              x: {
                beginAtZero: true,
              },
              y: {
                beginAtZero: true,
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Statistics;
