import { useEffect, useState } from "react";
import { getCandidates, voteCandidate } from "../api/api";

function Vote() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const data = await getCandidates();
        setCandidates(data);
      } catch (err) {
        console.error(err);
        alert("Failed to load candidates.");
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
  }, []);

  const handleVote = async (id, election_id) => {
    try {
      const data = await voteCandidate(id, election_id);
      alert(data.message || "Vote submitted!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit vote.");
    }
  };

  if (loading) return <p>Loading candidates...</p>;
  if (!candidates.length) return <p>No candidates available.</p>;

  return (
    <div>
      <h2>Vote</h2>
      {candidates.map((c) => (
        <div
          key={c.id}
          style={{
            border: "1px solid gray",
            margin: "10px",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <h3>{c.name}</h3>
          <p>Party: {c.party}</p>
          <p>
            Election: {c.election} | Position: {c.position}
          </p>
          {c.photo ? (
            <img
              src={`http://localhost:3000/uploads/${c.photo}`}
              alt={c.name}
              width="100"
              style={{ display: "block", marginBottom: "10px" }}
            />
          ) : (
            <p>No photo</p>
          )}
          <button onClick={() => handleVote(c.id, c.election_id)}>Vote</button>
        </div>
      ))}
    </div>
  );
}

export default Vote;