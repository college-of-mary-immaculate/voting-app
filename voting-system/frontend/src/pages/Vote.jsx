import { useEffect, useState } from "react";
import {
  getElections,
  getCandidatesByElection,
  voteCandidate,
  checkVote
} from "../api/api";
import socket from "../api/socket";
import "./Vote.css";

export default function Vote() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState(false);
  const [votedPositions, setVotedPositions] = useState({});
  const [timeRemaining, setTimeRemaining] = useState("");

  useEffect(() => {
    const load = async () => {
      const data = await getElections();
      setElections(data);

      if (data.length) {
        const latest = data.reduce((a, b) =>
          new Date(a.start_date) > new Date(b.start_date) ? a : b
        );
        setSelectedElection(latest);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const handler = async () => {
      const updated = await getElections();
      setElections(updated);

      if (selectedElection) {
        setSelectedElection(
          updated.find(e => e.id === selectedElection.id) || null
        );
      }
    };

    socket.on("election_update", handler);
    return () => socket.off("election_update", handler);
  }, [selectedElection]);

  useEffect(() => {
    if (!selectedElection) {
      setCandidates([]);
      setVotedPositions({});
      return;
    }

    setLoading(true);

    Promise.all([
      getCandidatesByElection(selectedElection.id),
      checkVote(selectedElection.id)
    ])
      .then(([candData, voteData]) => {
        setCandidates(candData);

        const voteMap = {};
        voteData.votedPositions.forEach(id => {
          voteMap[id] = true;
        });

        setVotedPositions(voteMap);
      })
      .finally(() => setLoading(false));
  }, [selectedElection]);

  useEffect(() => {
    if (!selectedElection) return;

    const handler = (data) => {
      const candidate = data.candidate;

      if (data.action === "added" && candidate.election_id === selectedElection.id) {
        setCandidates(prev => [...prev, candidate]);
      }

      if (data.action === "updated") {
        setCandidates(prev =>
          prev.map(c => (c.id === candidate.id ? { ...c, ...candidate } : c))
        );
      }

      if (data.action === "deleted") {
        setCandidates(prev =>
          prev.filter(c => c.id !== Number(data.candidateId))
        );
      }

      if (data.action === "photo_updated") {
        setCandidates(prev =>
          prev.map(c =>
            c.id === Number(data.candidateId)
              ? { ...c, photo: data.photo }
              : c
          )
        );
      }
    };

    socket.on("candidate_update", handler);
    return () => socket.off("candidate_update", handler);
  }, [selectedElection]);

  useEffect(() => {
    if (!selectedElection) return;

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(selectedElection.start_date);
      const end = new Date(selectedElection.end_date);

      if (now < start) {
        setTimeRemaining(`Upcoming: starts ${start.toLocaleString()}`);
      } else if (now <= end) {
        const diff = end - now;
        const h = Math.floor(diff / 1000 / 60 / 60);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);

        setTimeRemaining(`Active: ${h}h ${m}m ${s}s remaining`);
      } else {
        setTimeRemaining("Ended");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedElection]);

  const grouped = candidates.reduce((acc, c) => {
    const pos = c.position_title || "Unknown Position";
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(c);
    return acc;
  }, {});

  const isActive = (e) =>
    e &&
    new Date() >= new Date(e.start_date) &&
    new Date() <= new Date(e.end_date);

  const handleVote = async (c) => {
    if (!isActive(selectedElection)) return;
    if (votedPositions[c.position_id]) return;

    setVoting(true);

    try {
      await voteCandidate(c.id, selectedElection.id);

      setVotedPositions(prev => ({
        ...prev,
        [c.position_id]: c.id
      }));
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="vote-page page-section">
      <div className="vote-container container">
        <h1>Cast Your Vote</h1>
        <p>Select an election and view candidates.</p>

        <div className="election-select-card card">
          <label>Select Election</label>
          <select
            value={selectedElection?.id || ""}
            onChange={e =>
              setSelectedElection(
                elections.find(el => el.id === Number(e.target.value)) || null
              )
            }
          >
            <option value="">-- Select Election --</option>
            {elections.map(e => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>

        {selectedElection && (
          <div className="election-status-card card">
            <strong>Status:</strong> {timeRemaining}
          </div>
        )}

        {loading && <div>Loading candidates...</div>}

        {!loading &&
          Object.keys(grouped).map(pos => (
            <div key={pos} className="position-card card">
              <h2>{pos}</h2>

              {grouped[pos].map(c => {
                const votedId = votedPositions[c.position_id];
                const votedThis = votedId === c.id;
                const disabled = votedId && votedId !== c.id;

                return (
                  <div
                    key={c.id}
                    className={`candidate-card ${
                      disabled ? "candidate-disabled" : ""
                    } ${votedThis ? "candidate-selected" : ""}`}
                  >
                    <div className="candidate-photo-wrapper">
                      {c.photo ? (
                        <img
                          src={`http://localhost:3000/uploads/${c.photo}`}
                          alt={c.name}
                        />
                      ) : (
                        <div className="candidate-no-photo">
                          {c.name.charAt(0)}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3>{c.name}</h3>
                      <p>Party: {c.party}</p>
                    </div>

                    <button
                      disabled={
                        voting ||
                        disabled ||
                        !isActive(selectedElection)
                      }
                      onClick={() => handleVote(c)}
                    >
                      {votedThis ? "Voted ✓" : "Vote"}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
      </div>
    </div>
  );
}