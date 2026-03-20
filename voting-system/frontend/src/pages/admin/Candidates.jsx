import { useState } from "react";
import { addCandidate, updateCandidate, deleteCandidate } from "../../api/api";

function Candidates({ candidates, positions, elections, refresh }) {
  const [name, setName] = useState("");
  const [party, setParty] = useState("");
  const [electionId, setElectionId] = useState("");
  const [positionId, setPositionId] = useState("");
  const [photo, setPhoto] = useState(null);
  const [editId, setEditId] = useState(null);

  const getStatus = (start, end) => {
    const now = new Date();
    const startD = new Date(start);
    const endD = new Date(end);
    if (now < startD) return "Upcoming";
    if (now >= startD && now <= endD) return "Ongoing";
    if (now > endD) return "Ended";
    return "Unknown";
  };

  const isEditable = (electionId) => {
    const election = elections.find((e) => e.id === parseInt(electionId));
    if (!election) return false;
    const status = getStatus(election.start_date, election.end_date);
    return status === "Upcoming";
  };

  const resetForm = () => {
    setName("");
    setParty("");
    setElectionId("");
    setPositionId("");
    setPhoto(null);
    setEditId(null);
  };

  const handleAddOrUpdate = async () => {
    if (!name || !party || !electionId || !positionId) return alert("Please fill all fields");
    if (!isEditable(electionId)) return alert("Cannot modify candidates for ongoing or ended elections");

    try {
      if (editId) {
        await updateCandidate(editId, { name, party, election_id: electionId, position_id: positionId, photo });
        alert("Candidate updated");
      } else {
        await addCandidate({ name, party, election_id: electionId, position_id: positionId, photo });
        alert("Candidate added");
      }
      resetForm();
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (c) => {
    if (!isEditable(c.election_id)) return;
    setEditId(c.id);
    setName(c.name);
    setParty(c.party);
    setElectionId(c.election_id);
    setPositionId(c.position_id);
    setPhoto(null);
  };

  const handleDelete = async (id, electionId) => {
    if (!isEditable(electionId)) return;
    if (!window.confirm("Delete this candidate?")) return;

    try {
      await deleteCandidate(id);
      alert("Candidate deleted");
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const positionsForElection = electionId ? positions.filter((p) => p.election_id === parseInt(electionId)) : [];

  return (
    <div>
      {/* FORM */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "15px" }}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} disabled={editId && !isEditable(electionId)} />
        <input placeholder="Party" value={party} onChange={(e) => setParty(e.target.value)} disabled={editId && !isEditable(electionId)} />
        <select value={electionId} onChange={(e) => { setElectionId(e.target.value); setPositionId(""); }} disabled={editId && !isEditable(electionId)}>
          <option value="">Select Election</option>
          {elections.map((e) => {
            const status = getStatus(e.start_date, e.end_date);
            return <option key={e.id} value={e.id}>{e.title} ({status})</option>;
          })}
        </select>
        <select value={positionId} onChange={(e) => setPositionId(e.target.value)} disabled={editId && !isEditable(electionId)}>
          <option value="">Select Position</option>
          {positionsForElection.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input type="file" onChange={(e) => setPhoto(e.target.files[0])} disabled={editId && !isEditable(electionId)} />
        <button className="btn btn-primary" onClick={handleAddOrUpdate} disabled={editId && !isEditable(electionId)}>{editId ? "Update" : "Add"}</button>
        {editId && <button className="btn btn-delete" onClick={resetForm}>Cancel</button>}
      </div>

      {/* TABLE */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Party</th>
            <th>Election</th>
            <th>Position</th>
            <th>Photo</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((c) => {
            const election = elections.find((e) => e.id === c.election_id);
            const position = positions.find((p) => p.id === c.position_id);
            const editable = isEditable(c.election_id);

            return (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.party}</td>
                <td>{election?.title || "Unknown"}</td>
                <td>{position?.name || "Unknown"}</td>
                <td>
                  {c.photo && <img src={`http://localhost:3000/uploads/${c.photo}`} width="50" alt={c.name} style={{ borderRadius: "6px" }} />}
                </td>
                <td>
                  <button className="btn btn-edit" onClick={() => handleEdit(c)} disabled={!editable}>✏️ Edit</button>
                  <button className="btn btn-delete" onClick={() => handleDelete(c.id, c.election_id)} disabled={!editable}>🗑 Delete</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Candidates;