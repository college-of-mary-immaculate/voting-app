import { useEffect, useState } from "react";
import { getElections, getCandidatesByElection, voteCandidate } from "../api/api";

function Vote() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState(false);

  // Fetch elections on mount
  useEffect(() => {
    getElections()
      .then(setElections)
      .catch((err) => console.error("Failed to fetch elections:", err));
  }, []);

  // Fetch candidates for selected election
  useEffect(() => {
    if (!selectedElection) {
      setCandidates([]);
      return;
    }

    setLoading(true);
    getCandidatesByElection(selectedElection)
      .then(setCandidates)
      .catch((err) => console.error("Failed to fetch candidates:", err))
      .finally(() => setLoading(false));
  }, [selectedElection]);

  // Group candidates by position
  const groupedCandidates = candidates.reduce((acc, c) => {
    const pos = c.position || "Unknown Position";
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(c);
    return acc;
  }, {});

  const handleVote = async (candidateId) => {
    setVoting(true);
    try {
      const data = await voteCandidate(candidateId, selectedElection);
      alert(data.message || "Vote submitted!");
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

      {/* Election selector */}
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

      {/* Loading */}
      {loading && <p>Loading candidates...</p>}

      {/* No candidates */}
      {!loading && !candidates.length && selectedElection && (
        <p>No candidates available for this election.</p>
      )}

      {/* Candidates grouped by position */}
      {!loading &&
        Object.keys(groupedCandidates).map((position) => (
          <div key={position} style={{ marginBottom: "30px" }}>
            <h3>{position}</h3>
            {groupedCandidates[position].map((c) => (
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
                }}
              >
                {/* Candidate photo */}
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
                      color: "#666",
                    }}
                  >
                    No Photo
                  </div>
                )}

                {/* Candidate info */}
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0 }}>{c.name}</h4>
                  <p style={{ margin: "5px 0" }}>Party: {c.party || "N/A"}</p>
                </div>

                {/* Vote button */}
                <button
                  onClick={() => handleVote(c.id)}
                  disabled={voting}
                >
                  {voting ? "Voting..." : "Vote"}
                </button>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}

export default Vote;