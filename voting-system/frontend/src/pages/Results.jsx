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

  // Fetch elections
  useEffect(() => {
    getElections()
      .then(setElections)
      .catch((err) => console.error("Failed to fetch elections:", err));
  }, []);

  // Fetch results for selected election
  useEffect(() => {
    if (selectedElection) {
      getResults(selectedElection)
        .then(setResults)
        .catch((err) => console.error("Failed to fetch results:", err));
    } else {
      setResults([]);
    }
  }, [selectedElection]);

  // Group results by position
  const resultsByPosition = results.reduce((acc, r) => {
    const pos = r.position || "Unknown Position";
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(r);
    return acc;
  }, {});

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

      {selectedElection ? (
        Object.keys(resultsByPosition).length > 0 ? (
          Object.entries(resultsByPosition).map(([position, candidates]) => {
            const chartData = {
              labels: candidates.map((c) => c.candidate),
              datasets: [
                {
                  label: "# of Votes",
                  data: candidates.map((c) => c.votes),
                  backgroundColor: "rgba(75,192,192,0.6)",
                },
              ],
            };

            return (
              <div key={position} style={{ marginBottom: "40px" }}>
                <h3>{position}</h3>
                <Bar data={chartData} />
              </div>
            );
          })
        ) : (
          <p>No votes yet.</p>
        )
      ) : (
        <p>Please select an election to see results.</p>
      )}
    </div>
  );
}

export default Results;