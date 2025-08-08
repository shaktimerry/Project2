const API_URL = "https://lpn9up6lf8.execute-api.eu-north-1.amazonaws.com/dev/monitoring";

async function loadData() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        const availabilityBox = document.getElementById("availability");
        if (data.Availability === "UP") {
            availabilityBox.className = "status-box status-up";
            availabilityBox.textContent = "Status: UP";
        } else {
            availabilityBox.className = "status-box status-down";
            availabilityBox.textContent = "Status: DOWN";
        }

        document.getElementById("statusCode").textContent = `Status Code: ${data.StatusCode}`;
        document.getElementById("dbTime").textContent = `DB Query Time: ${data.DBQueryExecutionTime} ms`;
        document.getElementById("throttle").textContent = `Throttle Ops: ${data.ThrottleOperationCount}`;
        document.getElementById("lambdaTime").textContent = `Lambda Avg Time: ${data.LambdaAvgExecutionTime} ms`;

    } catch (err) {
        console.error("Error loading data", err);
    }
}

loadData();