// src/App.js

import React, { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://lpn9up6lf8.execute-api.eu-north-1.amazonaws.com/dev/monitoring";



function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL); // Replace with your API endpoint
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        // Important: your Lambda returns stringified JSON in 'body'
        setData(JSON.parse(result.body));
      } catch (error) {
        setError(error);
      } finally {
        // setLoading(false);
      }
    };

    fetchData();
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