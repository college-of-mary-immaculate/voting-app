import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getResults, getElections } from "../api/api";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Results() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [results, setResults] = useState([]);

  // Fetch elections from backend
  useEffect(() => {
    getElections()
      .then(setElections)
      .catch((err) => console.error("Failed to fetch elections:", err));
  }, []);

  // Fetch results when an election is selected
  useEffect(() => {
    if (selectedElection) {
      getResults(selectedElection)
        .then(setResults)
        .catch((err) => console.error("Failed to fetch results:", err));
    } else {
      setResults([]);
    }
  }, [selectedElection]);

  const chartData = {
    labels: results.map((r) => r.candidate),
    datasets: [
      {
        label: "# of Votes",
        data: results.map((r) => r.votes),
        backgroundColor: "rgba(75,192,192,0.6)",
      },
    ],
  };

  return (
    <div>
      <h2>Election Results</h2>

      <div style={{ marginBottom: "20px" }}>
        <label>Select Election: </label>
        <select
          value={selectedElection}
          onChange={(e) => setSelectedElection(e.target.value)}
        >
          <option value="">-- Select Election --</option>
          {elections.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title} ({e.start_date} to {e.end_date})
            </option>
          ))}
        </select>
      </div>

      {results.length > 0 ? (
        <Bar data={chartData} />
      ) : selectedElection ? (
        <p>No votes yet.</p>
      ) : (
        <p>Please select an election to see results.</p>
      )}
    </div>
  );
}

export default Results;