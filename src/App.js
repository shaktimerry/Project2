// src/App.js

import React, { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://lpn9up6lf8.execute-api.eu-north-1.amazonaws.com/dev/monitoring";

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(API_URL);
        const jsonData = await res.json();
        setData(jsonData);
      } catch (err) {
        console.error("Error loading data", err);
        setError("Failed to load monitoring data.");
      }
    }

    loadData();
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!data) {
    return <div className="loading">Loading monitoring data...</div>;
  }

  const statusClass = data.Availability === "UP" ? "status-box status-up" : "status-box status-down";

  return (
    <div className="monitoring-dashboard">
      <h2>System Monitoring Dashboard</h2>
      <div id="availability" className={statusClass}>
        Status: {data.Availability}
      </div>
      <div id="statusCode">Status Code: {data.StatusCode}</div>
      <div id="dbTime">DB Query Time: {data.DBQueryExecutionTime} ms</div>
      <div id="throttle">Throttle Ops: {data.ThrottleOperationCount}</div>
      <div id="lambdaTime">Lambda Avg Time: {data.LambdaAvgExecutionTime} ms</div>
    </div>
  );
}

export default App;