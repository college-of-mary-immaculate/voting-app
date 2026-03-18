import { useEffect, useState } from "react";
import {
  getElections,
  getCandidatesByElection,
  voteCandidate,
  checkVote,
} from "../api/api";
import "./Vote.css";

function Vote() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState(false);
  const [votedPositions, setVotedPositions] = useState({});
  const [notification, setNotification] = useState({
    message: "",
    type: "",
  });

  useEffect(() => {
    getElections()
      .then((data) => {
        setElections(data);
      })
      .catch((err) => console.error("Failed to fetch elections:", err));
  }, []);

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

  useEffect(() => {
    if (!notification.message) return;

    const timer = setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000);

    return () => clearTimeout(timer);
  }, [notification]);

  const groupedCandidates = candidates.reduce((acc, c) => {
    const posName = c.position || "Unknown Position";
    if (!acc[posName]) acc[posName] = [];
    acc[posName].push(c);
    return acc;
  }, {});

  const isElectionActive = (election) => {
    const now = new Date();
    const start = new Date(election.start_date);
    const end = new Date(election.end_date);
    return now >= start && now <= end;
  };

  const handleVote = async (candidate) => {
    if (!isElectionActive(selectedElection)) {
      setNotification({
        message: "You cannot vote in this election. It is not active.",
        type: "error",
      });
      return;
    }

    const positionId = candidate.position_id;

    if (votedPositions[positionId]) {
      setNotification({
        message: "You already voted for this position.",
        type: "error",
      });
      return;
    }

    setVoting(true);
    try {
      const data = await voteCandidate(candidate.id, selectedElection.id);
      setNotification({
        message: data.message || "Vote recorded successfully!",
        type: "success",
      });

      setVotedPositions((prev) => ({
        ...prev,
        [positionId]: candidate.id,
      }));
    } catch (err) {
      console.error(err);
      setNotification({
        message: err.message || "Failed to submit vote.",
        type: "error",
      });
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
            Select an active election and vote for your preferred candidates.
          </p>
        </div>

        {notification.message && (
          <div className={`vote-notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

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
              <option key={e.id} value={e.id} disabled={!isElectionActive(e)}>
                {e.title} ({new Date(e.start_date).toLocaleDateString()} -{" "}
                {new Date(e.end_date).toLocaleDateString()})
                {!isElectionActive(e) ? " (Not Active)" : ""}
              </option>
            ))}
          </select>
        </div>

        {loading && <div className="empty-state">Loading candidates...</div>}

        {!loading && selectedElection && !candidates.length && (
          <div className="empty-state">
            No candidates available for this election.
          </div>
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
                        <h3>{c.name}</h3>
                        <p>Party: {c.party || "N/A"}</p>
                      </div>

                      <div className="candidate-action">
                        {alreadyVotedThis ? (
                          <button
                            className="vote-button voted btn-primary"
                            disabled
                          >
                            Voted ✓
                          </button>
                        ) : (
                          <button
                            className="vote-button btn-primary"
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