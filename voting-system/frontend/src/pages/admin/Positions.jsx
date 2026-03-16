import { useState } from "react";

function Positions({ positions, elections, refresh }) {
  const [name, setName] = useState("");
  const [electionId, setElectionId] = useState("");
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

  const resetForm = () => { setName(""); setElectionId(""); setEditId(null); };

  const handleAddOrUpdate = async () => {
    if (!name || !electionId) return alert("Please fill all fields");

    const url = editId
      ? `http://localhost:3000/api/admin/positions/${editId}`
      : "http://localhost:3000/api/admin/positions";
    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, election_id: electionId }),
    });
    const data = await res.json();
    alert(data.message);
    resetForm();
    refresh();
  };

  const handleEdit = (p) => { setEditId(p.id); setName(p.name); setElectionId(p.election_id); };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this position?")) return;
    const res = await fetch(`http://localhost:3000/api/admin/positions/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    alert(data.message);
    refresh();
  };

  return (
    <div>
      <h3>Positions</h3>

      <div style={{ marginBottom: "15px" }}>
        <input placeholder="Position Name" value={name} onChange={e => setName(e.target.value)} />
        <select value={electionId} onChange={e => setElectionId(e.target.value)}>
          <option value="">Select Election</option>
          {elections.map(e => {
            const status = getStatus(e.start_date, e.end_date);
            return <option key={e.id} value={e.id}>{e.title} ({status})</option>
          })}
        </select>
        <button onClick={handleAddOrUpdate}>{editId ? "Update" : "Add"}</button>
        {editId && <button onClick={resetForm}>Cancel</button>}
      </div>

      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Name</th><th>Election</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {positions.map(p => {
            const election = elections.find(e => e.id === p.election_id);
            const status = election ? getStatus(election.start_date, election.end_date) : "Unknown";
            const editable = status === "Upcoming";
            return (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{election?.title || "Unknown"}</td>
                <td>{status}</td>
                <td>
                  {editable ? <>
                    <button onClick={() => handleEdit(p)}>Edit</button>
                    <button onClick={() => handleDelete(p.id)}>Delete</button>
                  </> : <span style={{ color: "gray" }}>Locked</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Positions;