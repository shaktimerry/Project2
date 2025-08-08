import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [monitorData, setMonitorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Replace this with your actual API Gateway endpoint for the Lambda function
  const API_URL = "https://ephn4vgj2f.execute-api.eu-north-1.amazonaws.com/Dev/Monitor_status";

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to fetch monitoring data");
        const data = await response.json();
        setMonitorData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="loader">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!monitorData) return <div>No Data Available</div>;

  const isPageAvailable = monitorData.Availability === "UP";

  return (
    <div className="dashboard">
      <h1>Monitoring Dashboard</h1>

      <div className={`availability ${isPageAvailable ? "up" : "down"}`}>
        <h2>Availability Board</h2>
        <p>Status: {isPageAvailable ? "Available" : "Unavailable"}</p>
      </div>

      <div className="metrics">
        <div className="metric">
          <h3>Status Code</h3>
          <p>{monitorData.StatusCode}</p>
        </div>
        <div className="metric">
          <h3>DB Query Execution Time (ms)</h3>
          <p>{monitorData.DBQueryExecutionTime}</p>
        </div>
        <div className="metric">
          <h3>Throttle Operations</h3>
          <p>{monitorData.ThrottleOperationCount}</p>
        </div>
        <div className="metric">
          <h3>Lambda Avg Execution Time (ms)</h3>
          <p>{monitorData.LambdaAvgExecutionTime}</p>
        </div>
      </div>
    </div>
  );
}

export default App;