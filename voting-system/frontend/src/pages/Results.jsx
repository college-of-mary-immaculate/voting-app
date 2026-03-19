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
import socket from "../api/socket";
import "./Results.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Results() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [results, setResults] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    getElections()
      .then((electionsData) => {
        setElections(electionsData);
        if (electionsData.length > 0) {
          const latestElection = electionsData.reduce((latest, current) => {
            return new Date(current.start_date) > new Date(latest.start_date)
              ? current
              : latest;
          }, electionsData[0]);
          setSelectedElection(latestElection.id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedElection && Number(selectedElection)) {
      getResults(selectedElection)
        .then(setResults)
        .catch((err) => console.error(err));
    } else {
      setResults([]);
      setTotalVotes(0);
    }
  }, [selectedElection]);

  useEffect(() => {
    if (!selectedElection) return;

    socket.emit("joinElection", selectedElection);

    const handleUpdate = (data) => {
      if (String(data.electionId) !== String(selectedElection)) return;

      setResults((prev) =>
        prev.map((r) =>
          r.candidate_id === data.candidateId
            ? { ...r, votes: r.votes + 1 }
            : r
        )
      );
    };

    socket.on("resultsUpdated", handleUpdate);

    return () => socket.off("resultsUpdated", handleUpdate);
  }, [selectedElection]);

  useEffect(() => {
    if (results.length > 0) {
      const total = results.reduce((sum, r) => sum + r.votes, 0);
      setTotalVotes(total);
    } else {
      setTotalVotes(0);
    }
  }, [results]);

  const resultsByPosition = results.reduce((acc, r) => {
    const pos = r.position ?? "Unknown Position";
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(r);
    return acc;
  }, {});

  const handleElectionChange = (e) => {
    const value = e.target.value;
    setSelectedElection(value ? Number(value) : null);
  };

  return (
    <div className="results-page page-section">
      <div className="results-container container">
        <div className="results-header">
          <h1 className="page-title">Election Results</h1>
          <p className="page-subtitle">
            View the current vote totals for each position and candidate.
          </p>
        </div>

        {}
        <div className="results-select-card card">
          <label>Select Election</label>
          <select
            className="form-select"
            value={selectedElection || ""}
            onChange={handleElectionChange}
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

        {}
        {selectedElection && results.length > 0 && (
          <div className="turnout-card">
            <h3>Total Votes Cast</h3>
            <p className="turnout-number">{totalVotes}</p>
          </div>
        )}

        {}
        {selectedElection ? (
          Object.keys(resultsByPosition).length > 0 ? (
            <div className="results-grid">
              {Object.entries(resultsByPosition).map(([position, candidates]) => {
                const sortedCandidates = [...candidates].sort(
                  (a, b) => b.votes - a.votes
                );
                const winnerIndex = sortedCandidates[0].votes > 0 ? 0 : -1;

                const chartData = {
                  labels: sortedCandidates.map((c) => c.candidate),
                  datasets: [
                    {
                      label: "# of Votes",
                      data: sortedCandidates.map((c) => c.votes),
                      backgroundColor: sortedCandidates.map((c, index) =>
                        index === winnerIndex ? "gold" : "rgba(37, 99, 235, 0.75)"
                      ),
                      borderRadius: 6,
                    },
                  ],
                };

                const chartOptions = {
                  indexAxis: "y",
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: { duration: 800, easing: "easeOutQuart" },
                  plugins: {
                    legend: { position: "top" },
                    title: { display: true, text: `${position} Results` },
                  },
                  scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
                };

                return (
                  <div key={position} className="result-card card">
                    <h2 className="result-title">{position}</h2>
                    <div className="chart-wrapper">
                      <Bar data={chartData} options={chartOptions} />
                    </div>

                    <div className="result-summary">
                      {sortedCandidates.map((c, index) => (
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
          <div className="empty-state">Please select an election to see results.</div>
        )}
      </div>
    </div>
  );
}

export default Results;