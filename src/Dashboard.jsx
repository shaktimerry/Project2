import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function ServerMonitoringDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sentimentData, setSentimentData] = useState([]);
  const [loadingSentiment, setLoadingSentiment] = useState(true);
  const [errorSentiment, setErrorSentiment] = useState(null);

  const apiCall = process.env.REACT_APP_REPEATED_API_CALL;

  // Existing monitoring API
  const API_URL =
    "https://lpn9up6lf8.execute-api.eu-north-1.amazonaws.com/dev/monitoring";

  // Aggregator API for customer feedback
  const FEEDBACK_API_URL =
    "https://lpn9up6lf8.execute-api.eu-north-1.amazonaws.com/dev/feedback-summary";

  // Fetch server metrics
  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      const parsedData =
        typeof data.body === "string" ? JSON.parse(data.body) : data;

      const newMetrics = {
        availability: parsedData.Availability,
        statusCode: parsedData.StatusCode,
        dbQueryExecutionTime: parsedData.DBQueryExecutionTime,
        throttleOperationCount: parsedData.ThrottleOperationCount,
        lambdaAvgExecutionTime: parsedData.LambdaAvgExecutionTime,
      };

      setMetrics(newMetrics);

      // Update history with timestamps
      setHistory((prev) => {
        const updated = [
          ...prev,
          {
            time: new Date().toLocaleTimeString(),
            ...newMetrics,
          },
        ];
        return updated.slice(-60); // Keep last 60 entries
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer feedback sentiment data
  const fetchSentimentData = async () => {
    try {
      setLoadingSentiment(true);
      setErrorSentiment(null);

      const response = await fetch(FEEDBACK_API_URL);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const raw = await response.json();

      // ✅ Fix: parse string body if necessary
      const parsed =
        typeof raw.body === "string" ? JSON.parse(raw.body) : raw;

      const chartData = [
        { name: "Positive", value: parsed.Positive || 0 },
        { name: "Negative", value: parsed.Negative || 0 },
        { name: "Neutral", value: parsed.Neutral || 0 },
      ];
      setSentimentData(chartData);
    } catch (err) {
      setErrorSentiment(err.message);
    } finally {
      setLoadingSentiment(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchSentimentData();

    if (apiCall === "true") {
      const intervalMetrics = setInterval(fetchMetrics, 10000);
      const intervalSentiment = setInterval(fetchSentimentData, 10000);
      return () => {
        clearInterval(intervalMetrics);
        clearInterval(intervalSentiment);
      };
    }
  }, []);

  if (loading && !metrics)
    return <p className="p-8 text-gray-600">Loading metrics...</p>;
  if (error) return <p className="p-8 text-red-500">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Server Monitoring Dashboard</h1>

      {/* Current metrics cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
        <Card
          title="Availability"
          value={metrics.availability}
          color={metrics.availability === "UP" ? "text-green-500" : "text-red-500"}
        />
        <Card
          title="Status Code"
          value={metrics.statusCode}
          color={metrics.statusCode === 200 ? "text-green-500" : "text-red-500"}
        />
        <Card
          title="DB Query Execution Time"
          value={`${metrics.dbQueryExecutionTime} ms`}
          color={
            metrics.dbQueryExecutionTime < 150
              ? "text-green-500"
              : metrics.dbQueryExecutionTime < 300
              ? "text-yellow-500"
              : "text-red-500"
          }
        />
        <Card
          title="Throttle Operation Count"
          value={metrics.throttleOperationCount}
          color={
            metrics.throttleOperationCount === 0
              ? "text-green-500"
              : metrics.throttleOperationCount < 3
              ? "text-yellow-500"
              : "text-red-500"
          }
        />
        <Card
          title="Lambda Avg Execution Time"
          value={`${metrics.lambdaAvgExecutionTime} ms`}
          color={
            metrics.lambdaAvgExecutionTime < 300
              ? "text-green-500"
              : metrics.lambdaAvgExecutionTime < 600
              ? "text-yellow-500"
              : "text-red-500"
          }
        />
      </div>

      {/* Existing Line Charts */}
      <div className="grid gap-10 md:grid-cols-2">
        <MetricChart
          data={history}
          dataKey="dbQueryExecutionTime"
          label="DB Query Execution Time (ms)"
        />
        <MetricChart
          data={history}
          dataKey="lambdaAvgExecutionTime"
          label="Lambda Avg Execution Time (ms)"
        />
        <MetricChart
          data={history}
          dataKey="throttleOperationCount"
          label="Throttle Operation Count"
        />
        <MetricChart data={history} dataKey="statusCode" label="Status Code" />
      </div>

      {/* New Pie Chart for Customer Feedback Sentiment */}
      <div className="bg-white p-6 rounded-xl shadow-md mt-10">
        <h2 className="text-lg font-semibold mb-4">Customer Feedback Sentiment</h2>
        {loadingSentiment ? (
          <p className="text-gray-500">Loading sentiment data...</p>
        ) : errorSentiment ? (
          <p className="text-red-500">Error: {errorSentiment}</p>
        ) : sentimentData.length === 0 ? (
          <p className="text-gray-500">No sentiment data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {sentimentData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.name === "Positive"
                        ? "#10B981" // green
                        : entry.name === "Negative"
                        ? "#EF4444" // red
                        : "#9CA3AF" // gray
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// Card component
function Card({ title, value, color = "text-gray-800" }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <h2 className="text-lg font-semibold text-gray-500">{title}</h2>
      <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
}

// Chart component
function MetricChart({ data, dataKey, label }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold mb-4">{label}</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" interval="preserveStartEnd" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
