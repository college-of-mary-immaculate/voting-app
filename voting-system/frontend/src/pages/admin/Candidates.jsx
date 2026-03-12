import { useState } from "react";

function Candidates({ candidates, positions, elections, refresh }) {
  const [name, setName] = useState("");
  const [party, setParty] = useState("");
  const [electionId, setElectionId] = useState("");
  const [positionId, setPositionId] = useState("");
  const [photo, setPhoto] = useState(null);
  const [editId, setEditId] = useState(null);

  const token = localStorage.getItem("token");

  const getStatus = (start, end) => {
    const now = new Date();
    const startD = new Date(start);
    const endD = new Date(end);
    if (now < startD) return "Upcoming";
    if (now >= startD && now <= endD) return "Ongoing";
    if (now > endD) return "Ended";
    return "Unknown";
  };

  const resetForm = () => { setName(""); setParty(""); setElectionId(""); setPositionId(""); setPhoto(null); setEditId(null); };

  const handleAddOrUpdate = async () => {
    if (!name || !party || !electionId || !positionId) return alert("Please fill all fields");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("party", party);
    formData.append("election_id", electionId);
    formData.append("position_id", positionId);
    if (photo) formData.append("photo", photo);

    let url = "http://localhost:3000/api/admin/candidates";
    let method = "POST";
    if (editId) { url += `/${editId}`; method = "PUT"; }

    const res = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: formData });
    const data = await res.json();
    alert(data.message);
    resetForm();
    refresh();
  };

  const handleEdit = (c) => { setEditId(c.id); setName(c.name); setParty(c.party); setElectionId(c.election_id); setPositionId(c.position_id); setPhoto(null); };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this candidate?")) return;
    const res = await fetch(`http://localhost:3000/api/admin/candidates/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    alert(data.message);
    refresh();
  };

  // Only positions for upcoming elections
  const positionsForElection = electionId
    ? positions.filter(p => {
        const e = elections.find(ev => ev.id === parseInt(electionId));
        return e && getStatus(e.start_date, e.end_date) === "Upcoming" && p.election_id === parseInt(electionId);
      })
    : [];

  return (
    <div>
      <h3>Candidates</h3>

      <div style={{ marginBottom: "15px" }}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Party" value={party} onChange={e => setParty(e.target.value)} />
        <select value={electionId} onChange={e => { setElectionId(e.target.value); setPositionId(""); }}>
          <option value="">Select Election</option>
          {elections.map(e => {
            const status = getStatus(e.start_date, e.end_date);
            return <option key={e.id} value={e.id} disabled={status !== "Upcoming"}>{e.title} ({status})</option>
          })}
        </select>
        <select value={positionId} onChange={e => setPositionId(e.target.value)}>
          <option value="">Select Position</option>
          {positionsForElection.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input type="file" onChange={e => setPhoto(e.target.files[0])} />
        <button onClick={handleAddOrUpdate}>{editId ? "Update" : "Add"}</button>
        {editId && <button onClick={resetForm}>Cancel</button>}
      </div>

      <table border="1" cellPadding="5">
        <thead>
          <tr><th>Name</th><th>Party</th><th>Election</th><th>Position</th><th>Photo</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {candidates.map(c => {
            const election = elections.find(e => e.id === c.election_id);
            const position = positions.find(p => p.id === c.position_id);
            return (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.party}</td>
                <td>{election?.title || "Unknown"}</td>
                <td>{position?.name || "Unknown"}</td>
                <td>{c.photo && <img src={`http://localhost:3000/uploads/${c.photo}`} width="50" alt={c.name} />}</td>
                <td>
                  <button onClick={() => handleEdit(c)}>Edit</button>
                  <button onClick={() => handleDelete(c.id)}>Delete</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Candidates;