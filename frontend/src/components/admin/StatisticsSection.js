import React from "react";
import Statistics from "./Statistics";

const StatisticsSection = () => {
  return (
    <div className="section statistics-container">
      <h2>Statistics</h2>
      <div className="chart-wrapper">
        <Statistics />
      </div>
    </div>
  );
};

export default StatisticsSection;
