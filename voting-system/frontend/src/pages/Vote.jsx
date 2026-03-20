import { useEffect, useState, useRef } from "react";
import {
  getElections,
  getCandidatesByElection,
  voteCandidate,
  checkVote,
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

  const selectedElectionRef = useRef(null);
  useEffect(() => { selectedElectionRef.current = selectedElection; }, [selectedElection]);

  useEffect(() => {
    const loadElections = async () => {
      try {
        const data = await getElections();
        setElections(data);
        if (data.length) {
          const latest = data.reduce((a, b) =>
            new Date(a.start_date) > new Date(b.start_date) ? a : b
          );
          setSelectedElection(latest);
        }
      } catch (err) {
        console.error("Load elections error:", err);
      }
    };
    loadElections();
  }, []);

  useEffect(() => {
    const handleElectionUpdate = async () => {
      try {
        const updated = await getElections();
        setElections(updated);
        if (selectedElectionRef.current) {
          setSelectedElection(
            updated.find(e => e.id === selectedElectionRef.current.id) || null
          );
        }
      } catch (err) {
        console.error("Election update error:", err);
      }
    };
    socket.on("election_update", handleElectionUpdate);
    return () => socket.off("election_update", handleElectionUpdate);
  }, []);

  const loadCandidates = async (electionId) => {
    setLoading(true);
    try {
      const [candData, voteData] = await Promise.all([
        getCandidatesByElection(electionId),
        checkVote(electionId),
      ]);

      const map = new Map();
      candData.forEach(c => {
        if (c.election_id === electionId) map.set(c.id, c);
      });
      setCandidates(Array.from(map.values()));

      const voteMap = {};
      (voteData?.votedPositions || []).forEach(posId => { voteMap[posId] = true; });
      setVotedPositions(voteMap);
    } catch (err) {
      console.error("Load candidates error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedElection) return;
    loadCandidates(selectedElection.id);
  }, [selectedElection]);

  useEffect(() => {
    const handleCandidateUpdate = (data) => {
      const currentElection = selectedElectionRef.current;
      if (!currentElection) return;

      setCandidates(prev => {
        const map = new Map(prev.map(c => [c.id, c]));
        switch (data.action) {
          case "added":
            if (data.candidate?.election_id === currentElection.id) map.set(data.candidate.id, data.candidate);
            break;
          case "updated":
            if (map.has(data.candidate.id)) map.set(data.candidate.id, { ...map.get(data.candidate.id), ...data.candidate });
            break;
          case "deleted":
            map.delete(Number(data.candidateId));
            break;
          case "photo_updated":
            if (map.has(Number(data.candidateId))) {
              map.set(Number(data.candidateId), { ...map.get(Number(data.candidateId)), photo: data.photo });
            }
            break;
        }
        return Array.from(map.values());
      });
    };
    socket.on("candidate_update", handleCandidateUpdate);
    return () => socket.off("candidate_update", handleCandidateUpdate);
  }, []);

  useEffect(() => {
    if (!selectedElection) return;

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(selectedElection.start_date);
      const end = new Date(selectedElection.end_date);

      if (now < start) setTimeRemaining(`Upcoming: starts ${start.toLocaleString()}`);
      else if (now <= end) {
        const diff = end - now;
        const h = Math.floor(diff / 1000 / 60 / 60);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeRemaining(`Active: ${h}h ${m}m ${s}s remaining`);
      } else setTimeRemaining("Ended");
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedElection]);

  const grouped = candidates.reduce((acc, c) => {
    const pos = c.position_title || c.position_id || "Unknown Position";
    if (!acc[pos]) acc[pos] = [];
    acc[pos].push(c);
    return acc;
  }, {});

  const isActive = e => e && new Date() >= new Date(e.start_date) && new Date() <= new Date(e.end_date);

  const handleVote = async (c) => {
    if (!isActive(selectedElection)) return;
    if (votedPositions[c.position_id]) return;

    setVoting(true);
    try {
      await voteCandidate(c.id, selectedElection.id);
      setVotedPositions(prev => ({ ...prev, [c.position_id]: true }));

      if (socket?.connected) {
        socket.emit("vote_cast", { electionId: selectedElection.id, candidateId: c.id });
      }
    } catch (err) {
      console.error("Vote error:", err);
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
            onChange={e => setSelectedElection(elections.find(el => el.id === Number(e.target.value)) || null)}
          >
            <option value="">-- Select Election --</option>
            {elections.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </select>
        </div>

        {selectedElection && (
          <div className="election-status-card card">
            <strong>Status:</strong> {timeRemaining}
          </div>
        )}

        {loading && <div>Loading candidates...</div>}

        {!loading && Object.keys(grouped).map(pos => (
          <div key={pos} className="position-card card">
            <h2>{pos}</h2>
            {grouped[pos].map(c => {
              const votedThis = votedPositions[c.position_id];
              const disabled = votedThis && votedThis !== c.id;

              return (
                <div key={c.id} className={`candidate-card ${disabled ? "candidate-disabled" : ""} ${votedThis ? "candidate-selected" : ""}`}>
                  <div className="candidate-photo-wrapper">
                    {c.photo ? <img src={`/uploads/${c.photo}`} alt={c.name} /> :
                      <div className="candidate-no-photo">{c.name.charAt(0)}</div>}
                  </div>

                  <div>
                    <h3>{c.name}</h3>
                    <p>Party: {c.party}</p>
                  </div>

                  <button disabled={voting || disabled || !isActive(selectedElection)}
                    onClick={() => handleVote(c)}>
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