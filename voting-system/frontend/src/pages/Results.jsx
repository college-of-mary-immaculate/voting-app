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
import "./Results.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Results() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    getElections()
      .then(setElections)
      .catch((err) => console.error("Failed to fetch elections:", err));
  }, []);

  useEffect(() => {
    if (selectedElection) {
      getResults(selectedElection)
        .then(setResults)
        .catch((err) => console.error("Failed to fetch results:", err));
    } else {
      setResults([]);
    }
  }, [selectedElection]);

  const resultsByPosition = results.reduce((acc, r) => {
    const pos = r.position || "Unknown Position";
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(r);
    return acc;
  }, {});

  return (
    <div className="results-page page-section">
      <div className="results-container container">
        <div className="results-header">
          <h1 className="page-title">Election Results</h1>
          <p className="page-subtitle">
            View the current vote totals for each position and candidate.
          </p>
        </div>

        <div className="results-select-card card">
          <label>Select Election</label>
          <select
            className="form-select"
            value={selectedElection}
            onChange={(e) => setSelectedElection(e.target.value)}
          >
            <option value="">-- Select Election --</option>
            {elections.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} ({new Date(e.start_date).toLocaleDateString()} to{" "}
                {new Date(e.end_date).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        {selectedElection ? (
          Object.keys(resultsByPosition).length > 0 ? (
            <div className="results-grid">
              {Object.entries(resultsByPosition).map(([position, candidates]) => {
                const chartData = {
                  labels: candidates.map((c) => c.candidate),
                  datasets: [
                    {
                      label: "# of Votes",
                      data: candidates.map((c) => c.votes),
                      backgroundColor: "rgba(37, 99, 235, 0.75)",
                      borderRadius: 6,
                    },
                  ],
                };

                const chartOptions = {
                  indexAxis: "y",
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "top" },
                    title: { display: true, text: `${position} Results` },
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                    y: {
                      beginAtZero: true,
                    },
                  },
                };

                return (
                  <div key={position} className="result-card card">
                    <h2 className="result-title">{position}</h2>

                    <div className="chart-wrapper">
                      <Bar data={chartData} options={chartOptions} />
                    </div>

                    <div className="result-summary">
                      {candidates.map((c, index) => (
                        <div key={index} className="result-row">
                          <span>{c.candidate}</span>
                          <strong>{c.votes} vote(s)</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">No votes yet.</div>
          )
        ) : (
          <div className="empty-state">
            Please select an election to see results.
          </div>
        )}
      </div>
    </div>
  );
}

export default Results;