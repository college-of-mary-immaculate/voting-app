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
    if (!name || !party || !electionId || !positionId) {
      return alert("Please fill all fields");
    }

    if (!isEditable(electionId)) {
      return alert("Cannot modify candidates for ongoing or ended elections");
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("party", party);
    formData.append("election_id", electionId);
    formData.append("position_id", positionId);
    if (photo) formData.append("photo", photo);

    let url = "http://localhost:3000/api/admin/candidates";
    let method = "POST";

    if (editId) {
      url += `/${editId}`;
      method = "PUT";
    }

    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    alert(data.message);

    resetForm();
    refresh();
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

    const res = await fetch(
      `http://localhost:3000/api/admin/candidates/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    alert(data.message);
    refresh();
  };

  const positionsForElection = electionId
    ? positions.filter((p) => p.election_id === parseInt(electionId))
    : [];

  return (
    <div>
      {/* FORM */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={editId && !isEditable(electionId)}
        />

        <input
          placeholder="Party"
          value={party}
          onChange={(e) => setParty(e.target.value)}
          disabled={editId && !isEditable(electionId)}
        />

        <select
          value={electionId}
          onChange={(e) => {
            setElectionId(e.target.value);
            setPositionId("");
          }}
          disabled={editId && !isEditable(electionId)}
        >
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

        <select
          value={positionId}
          onChange={(e) => setPositionId(e.target.value)}
          disabled={editId && !isEditable(electionId)}
        >
          <option value="">Select Position</option>
          {positionsForElection.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <input
          type="file"
          onChange={(e) => setPhoto(e.target.files[0])}
          disabled={editId && !isEditable(electionId)}
        />

        <button
          className="btn btn-primary"
          onClick={handleAddOrUpdate}
          disabled={editId && !isEditable(electionId)}
        >
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
                <td data-label="Name">{c.name}</td>
                <td data-label="Party">{c.party}</td>
                <td data-label="Election">{election?.title || "Unknown"}</td>
                <td data-label="Position">{position?.name || "Unknown"}</td>
                <td data-label="Photo">
                  {c.photo && (
                    <img
                      src={`http://localhost:3000/uploads/${c.photo}`}
                      width="50"
                      alt={c.name}
                      style={{ borderRadius: "6px" }}
                    />
                  )}
                </td>

                <td data-label="Actions">
                  <button
                    className="btn btn-edit"
                    onClick={() => handleEdit(c)}
                    disabled={!editable}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    className="btn btn-delete"
                    onClick={() => handleDelete(c.id, c.election_id)}
                    disabled={!editable}
                  >
                    🗑 Delete
                  </button>
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