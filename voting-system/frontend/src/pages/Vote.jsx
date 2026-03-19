import { useEffect, useState } from "react";
import {
  getElections,
  getCandidatesByElection,
  voteCandidate,
  checkVote,
} from "../api/api";
import socket from "../api/socket";
import "./Vote.css";

function Vote() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState(false);
  const [votedPositions, setVotedPositions] = useState({});
  const [timeRemaining, setTimeRemaining] = useState("");

  // Load elections on mount
  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      const data = await getElections();
      setElections(data);

      if (data.length > 0) {
        // Select the latest election by start_date
        const latestElection = data.reduce((latest, current) => {
          return new Date(current.start_date) > new Date(latest.start_date)
            ? current
            : latest;
        }, data[0]);

        setSelectedElection(latestElection);
      }
    } catch (err) {
      console.error("Failed to fetch elections:", err);
    }
  };

  // Socket updates for elections
  useEffect(() => {
    socket.on("election_update", async () => {
      const updatedElections = await getElections();
      setElections([...updatedElections]);

      if (selectedElection) {
        const updated = updatedElections.find(
          (e) => e.id === selectedElection.id
        );
        setSelectedElection(updated || null);
      }
    });

    return () => socket.off("election_update");
  }, [selectedElection]);

  // Load candidates & voting info when election changes
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

        const votedMap = {};
        votedData.votedPositions.forEach((posId) => {
          votedMap[posId] = true;
        });
        setVotedPositions(votedMap);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedElection]);

  // Timer for active election countdown
  useEffect(() => {
    if (!selectedElection) return;

    const updateTimer = () => {
      const now = new Date();
      const start = new Date(selectedElection.start_date);
      const end = new Date(selectedElection.end_date);

      if (now < start) {
        setTimeRemaining(`Upcoming: starts ${start.toLocaleString()}`);
      } else if (now >= start && now <= end) {
        const diff = end - now;
        const hours = Math.floor(diff / 1000 / 60 / 60);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeRemaining(`Active: ${hours}h ${minutes}m ${seconds}s remaining`);
      } else {
        setTimeRemaining("Ended");
      }
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, [selectedElection]);

  const groupedCandidates = candidates.reduce((acc, c) => {
    const posName = c.position || "Unknown Position";
    if (!acc[posName]) acc[posName] = [];
    acc[posName].push(c);
    return acc;
  }, {});

  const isElectionActive = (election) => {
    if (!election) return false;
    const now = new Date();
    const start = new Date(election.start_date);
    const end = new Date(election.end_date);
    return now >= start && now <= end;
  };

  const handleVote = async (candidate) => {
    if (!isElectionActive(selectedElection)) return;

    const positionId = candidate.position_id;

    if (votedPositions[positionId]) return;

    setVoting(true);

    try {
      await voteCandidate(candidate.id, selectedElection.id);

      setVotedPositions((prev) => ({
        ...prev,
        [positionId]: candidate.id,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="vote-page page-section">
      <div className="vote-container container">
        <div className="vote-header">
          <h1 className="page-title">Cast Your Vote</h1>
          <p className="page-subtitle">
            Select an election and view candidates. Voting is disabled for inactive elections.
          </p>
        </div>

        <div className="election-select-card card">
          <label>Select Election</label>
          <select
            className="form-select"
            value={selectedElection?.id || ""}
            onChange={(e) =>
              setSelectedElection(
                elections.find((el) => el.id === Number(e.target.value)) || null
              )
            }
          >
            <option value="">-- Select Election --</option>
            {elections.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} ({new Date(e.start_date).toLocaleDateString()} -{" "}
                {new Date(e.end_date).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        {/* Election status / countdown */}
        {selectedElection && (
          <div className="election-status-card card">
            <strong>Status: </strong> {timeRemaining}
          </div>
        )}

        {loading && <div className="empty-state">Loading candidates...</div>}

        {!loading && selectedElection && !candidates.length && (
          <div className="empty-state">No candidates available for this election.</div>
        )}

        {!loading && !selectedElection && (
          <div className="empty-state">Please select an election first.</div>
        )}

        {!loading &&
          Object.keys(groupedCandidates).map((position) => (
            <div key={position} className="position-card card">
              <div className="position-header">
                <h2 className="position-title">{position}</h2>
              </div>

              <div className="candidate-list">
                {groupedCandidates[position].map((c) => {
                  const votedCandidateId = votedPositions[c.position_id];
                  const alreadyVotedThis = votedCandidateId === c.id;
                  const isVotedOtherCandidate =
                    votedCandidateId && votedCandidateId !== c.id;

                  return (
                    <div
                      key={c.id}
                      className={`candidate-card ${
                        isVotedOtherCandidate ? "candidate-disabled" : ""
                      } ${alreadyVotedThis ? "candidate-selected" : ""}`}
                    >
                      <div className="candidate-photo-wrapper">
                        {c.photo ? (
                          <img
                            src={`http://localhost:3000/uploads/${c.photo}`}
                            alt={c.name}
                            className="candidate-photo"
                          />
                        ) : (
                          <div className="candidate-no-photo">
                            <span className="candidate-initial">
                              {c.name ? c.name.charAt(0).toUpperCase() : "?"}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="candidate-info">
                        <div className="candidate-name-row">
                          <h3>{c.name}</h3>
                        </div>
                        <p>Party: {c.party || "N/A"}</p>
                      </div>

                      <div className="candidate-action">
                        <button
                          className={`vote-button btn-primary ${
                            alreadyVotedThis ? "voted" : ""
                          }`}
                          onClick={() => handleVote(c)}
                          disabled={
                            voting ||
                            isVotedOtherCandidate ||
                            !isElectionActive(selectedElection)
                          }
                        >
                          {alreadyVotedThis ? "Voted ✓" : "Vote"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Vote;