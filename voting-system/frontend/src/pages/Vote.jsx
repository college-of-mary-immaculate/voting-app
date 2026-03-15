import { useEffect, useState } from "react";
import {
  getElections,
  getCandidatesByElection,
  voteCandidate,
  checkVote,
} from "../api/api";

function Vote() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState(false);

  // Track votes per position (store candidate id)
  const [votedPositions, setVotedPositions] = useState({});

  //////////////////////////////////////////
  // Fetch elections on mount
  //////////////////////////////////////////
  useEffect(() => {
    getElections()
      .then((data) => {
        setElections(data);
      })
      .catch((err) => console.error("Failed to fetch elections:", err));
  }, []);

  //////////////////////////////////////////
  // Fetch candidates + user votes when election changes
  //////////////////////////////////////////
  useEffect(() => {
    if (!selectedElection) {
      setCandidates([]);
      setVotedPositions({});
      return;
    }

    setLoading(true);

    Promise.all([
      getCandidatesByElection(selectedElection.id),
      checkVote(selectedElection.id),
    ])
      .then(([candidateData, votedData]) => {
        setCandidates(candidateData);

        // Map positions → candidate id
        const votedMap = {};
        votedData.votedPositions.forEach((posId) => {
          votedMap[posId] = true; // store that user voted for this position
        });
        setVotedPositions(votedMap);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedElection]);

  //////////////////////////////////////////
  // Group candidates by position name
  //////////////////////////////////////////
  const groupedCandidates = candidates.reduce((acc, c) => {
    const posName = c.position || "Unknown Position";
    if (!acc[posName]) acc[posName] = [];
    acc[posName].push(c);
    return acc;
  }, {});

  //////////////////////////////////////////
  // Election status helper
  //////////////////////////////////////////
  const isElectionActive = (election) => {
    const now = new Date();
    const start = new Date(election.start_date);
    const end = new Date(election.end_date);
    return now >= start && now <= end;
  };

  //////////////////////////////////////////
  // Handle vote
  //////////////////////////////////////////
  const handleVote = async (candidate) => {
    if (!isElectionActive(selectedElection)) {
      alert("You cannot vote in this election. It is not active.");
      return;
    }

    const positionId = candidate.position_id;

    if (votedPositions[positionId]) {
      alert("You already voted for this position.");
      return;
    }

    setVoting(true);
    try {
      const data = await voteCandidate(candidate.id, selectedElection.id);
      alert(data.message || "Vote recorded!");

      setVotedPositions((prev) => ({
        ...prev,
        [positionId]: candidate.id,
      }));
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to submit vote.");
    } finally {
      setVoting(false);
    }
  };

  //////////////////////////////////////////
  // Render
  //////////////////////////////////////////
  return (
    <div>
      <h2>Vote</h2>

      {/* Election selector */}
      <div style={{ marginBottom: "20px" }}>
        <label>Select Election: </label>
        <select
          value={selectedElection?.id || ""}
          onChange={(e) =>
            setSelectedElection(
              elections.find((el) => el.id === Number(e.target.value)) || null
            )
          }
        >
          <option value="">-- Select Election --</option>
          {elections.map((e) => (
            <option key={e.id} value={e.id} disabled={!isElectionActive(e)}>
              {e.title} (
              {new Date(e.start_date).toLocaleDateString()} -{" "}
              {new Date(e.end_date).toLocaleDateString()})
              {!isElectionActive(e) ? " (Not Active)" : ""}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading candidates...</p>}

      {!loading && selectedElection && !candidates.length && (
        <p>No candidates available for this election.</p>
      )}

      {!loading &&
        Object.keys(groupedCandidates).map((position) => (
          <div key={position} style={{ marginBottom: "30px" }}>
            <h3>{position}</h3>
            {groupedCandidates[position].map((c) => {
              const votedCandidateId = votedPositions[c.position_id];
              const alreadyVotedThis = votedCandidateId === c.id;
              const isVotedOtherCandidate =
                votedCandidateId && votedCandidateId !== c.id;

              return (
                <div
                  key={c.id}
                  style={{
                    display: "flex",
                    gap: "15px",
                    alignItems: "center",
                    padding: "10px",
                    border: "1px solid gray",
                    borderRadius: "5px",
                    margin: "10px 0",
                    opacity: isVotedOtherCandidate ? 0.5 : 1,
                  }}
                >
                  {/* Photo */}
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
                        justifyContent: "center",
                        alignItems: "center",
                        borderRadius: "5px",
                        fontSize: "12px",
                      }}
                    >
                      No Photo
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0 }}>{c.name}</h4>
                    <p style={{ margin: "5px 0" }}>Party: {c.party || "N/A"}</p>
                  </div>

                  {/* Button */}
                  {alreadyVotedThis ? (
                    <button disabled>Voted ✓</button>
                  ) : (
                    <button
                      onClick={() => handleVote(c)}
                      disabled={
                        voting ||
                        isVotedOtherCandidate ||
                        !isElectionActive(selectedElection)
                      }
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