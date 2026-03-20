import { useState } from "react";
import { addPosition, updatePosition, deletePosition } from "../../api/api";

function Positions({ positions, elections, refresh }) {
  const [name, setName] = useState("");
  const [electionId, setElectionId] = useState("");
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

  const resetForm = () => {
    setName("");
    setElectionId("");
    setEditId(null);
  };

  const handleAddOrUpdate = async () => {
    if (!name || !electionId) return alert("Please fill all fields");

    try {
      if (editId) {
        await updatePosition(editId, { name, election_id: electionId });
        alert("Position updated");
      } else {
        await addPosition({ name, election_id: electionId });
        alert("Position added");
      }
      resetForm();
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (p) => {
    setEditId(p.id);
    setName(p.name);
    setElectionId(p.election_id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this position?")) return;
    try {
      await deletePosition(id);
      alert("Position deleted");
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "15px" }}>
        <input
          placeholder="Position Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select value={electionId} onChange={(e) => setElectionId(e.target.value)}>
          <option value="">Select Election</option>
          {elections.map((e) => {
            const status = getStatus(e.start_date, e.end_date);
            return (
              <option key={e.id} value={e.id}>
                {e.title} ({status})
              </option>
            );
          })}
        </select>

        <button className="btn btn-primary" onClick={handleAddOrUpdate}>
          {editId ? "Update" : "Add"}
        </button>

        {editId && (
          <button className="btn btn-delete" onClick={resetForm}>
            Cancel
          </button>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Election</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((p) => {
            const election = elections.find((e) => e.id === p.election_id);
            const status = election ? getStatus(election.start_date, election.end_date) : "Unknown";
            const editable = status === "Upcoming";

            return (
              <tr key={p.id}>
                <td data-label="Name">{p.name}</td>
                <td data-label="Election">{election?.title || "Unknown"}</td>
                <td data-label="Status"><span className={`status ${status.toLowerCase()}`}>{status}</span></td>
                <td data-label="Actions">
                  {editable ? (
                    <>
                      <button className="btn btn-edit" onClick={() => handleEdit(p)}>✏️ Edit</button>
                      <button className="btn btn-delete" onClick={() => handleDelete(p.id)}>🗑 Delete</button>
                    </>
                  ) : (
                    <span style={{ color: "gray" }}>🔒 Locked</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Positions;