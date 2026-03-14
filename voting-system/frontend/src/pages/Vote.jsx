import { useEffect, useState } from "react";
import {
  getElections,
  getCandidatesByElection,
  voteCandidate,
  checkVote,
} from "../api/api";

function Vote() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState(false);

  // Track positions already voted
  const [votedPositions, setVotedPositions] = useState({});

  // Fetch elections on mount
  useEffect(() => {
    getElections()
      .then(setElections)
      .catch((err) => console.error("Failed to fetch elections:", err));
  }, []);

  // Fetch candidates and already voted positions when election is selected
  useEffect(() => {
    if (!selectedElection) {
      setCandidates([]);
      setVotedPositions({});
      return;
    }

    setLoading(true);

    Promise.all([
      getCandidatesByElection(selectedElection),
      checkVote(selectedElection),
    ])
      .then(([candidateData, votedData]) => {
        setCandidates(candidateData);

        // Map positions to prevent voting again
        const votedMap = {};
        votedData.votedPositions.forEach((posId) => {
          votedMap[posId] = true;
        });
        setVotedPositions(votedMap);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedElection]);

  // Group candidates by position name
  const groupedCandidates = candidates.reduce((acc, c) => {
    const pos = c.position || "Unknown Position";
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(c);
    return acc;
  }, {});

  const handleVote = async (candidate) => {
    const positionId = candidate.position_id;

    if (votedPositions[positionId]) {
      alert("You already voted for this position.");
      return;
    }

    setVoting(true);
    try {
      const data = await voteCandidate(candidate.id, selectedElection);
      alert(data.message || "Vote submitted!");

      setVotedPositions((prev) => ({
        ...prev,
        [positionId]: candidate.id,
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to submit vote.");
    } finally {
      setVoting(false);
    }
  };

  return (
    <div>
      <h2>Vote</h2>

      <div style={{ marginBottom: "20px" }}>
        <label>Select Election: </label>
        <select
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

      {loading && <p>Loading candidates...</p>}

      {!loading && !candidates.length && selectedElection && (
        <p>No candidates available for this election.</p>
      )}

      {!loading &&
        Object.keys(groupedCandidates).map((position) => (
          <div key={position} style={{ marginBottom: "30px" }}>
            <h3>{position}</h3>
            {groupedCandidates[position].map((c) => {
              const voted = votedPositions[c.position_id];
              return (
                <div
                  key={c.id}
                  style={{
                    border: "1px solid gray",
                    margin: "10px 0",
                    padding: "10px",
                    borderRadius: "5px",
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    opacity: voted && voted !== c.id ? 0.5 : 1,
                  }}
                >
                  {c.photo ? (
                    <img
                      src={`http://localhost:3000/uploads/${c.photo}`}
                      alt={c.name}
                      width="80"
                      style={{ borderRadius: "5px" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "80px",
                        height: "80px",
                        background: "#eee",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "5px",
                        fontSize: "12px",
                      }}
                    >
                      No Photo
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0 }}>{c.name}</h4>
                    <p style={{ margin: "5px 0" }}>
                      Party: {c.party || "N/A"}
                    </p>
                  </div>

                  {voted === c.id ? (
                    <button disabled>Voted ✓</button>
                  ) : (
                    <button
                      onClick={() => handleVote(c)}
                      disabled={voting || voted}
                    >
                      {voting ? "Voting..." : "Vote"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
    </div>
  );
}

export default Vote;