import { useState } from "react";
import { addElection, updateElection, deleteElection } from "../../api/api";

function Elections({ elections, refresh }) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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
    setTitle("");
    setStartDate("");
    setEndDate("");
    setEditId(null);
  };

  const handleAddOrUpdate = async () => {
    if (!title || !startDate || !endDate) return alert("Please fill all fields");

    try {
      if (editId) {
        await updateElection(editId, { title, start_date: startDate, end_date: endDate });
        alert("Election updated");
      } else {
        await addElection({ title, start_date: startDate, end_date: endDate });
        alert("Election added");
      }
      resetForm();
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (election) => {
    setEditId(election.id);
    setTitle(election.title);
    setStartDate(election.start_date);
    setEndDate(election.end_date);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this election?")) return;
    try {
      await deleteElection(id);
      alert("Election deleted");
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  // unified start/end handler
  const handleSetDate = async (election, type) => {
    if (!window.confirm(`${type} this election now?`)) return;

    try {
      const now = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
      const updated = {
        title: election.title,
        start_date: type === "Start" ? now : election.start_date,
        end_date: type === "End" ? now : election.end_date,
      };

      await updateElection(election.id, updated);
      alert(`Election ${type.toLowerCase()}ed`);
      refresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      {/* Form */}
      <div style={{ marginBottom: "15px" }}>
        <input
          placeholder="Election Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <button className="btn btn-primary" onClick={handleAddOrUpdate}>
          {editId ? "Update" : "Add"}
        </button>

        {editId && (
          <button className="btn btn-delete" onClick={resetForm}>
            Cancel
          </button>
        )}
      </div>

      {/* Elections Table */}
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Start</th>
            <th>End</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {elections.map((e) => {
            const status = getStatus(e.start_date, e.end_date);

            return (
              <tr key={e.id}>
                <td data-label="Title">{e.title}</td>
                <td data-label="Start">{e.start_date}</td>
                <td data-label="End">{e.end_date}</td>
                <td data-label="Status">
                  <span className={`status ${status.toLowerCase()}`}>{status}</span>
                </td>
                <td data-label="Actions">
                  {status === "Upcoming" && (
                    <>
                      <button className="btn btn-edit" onClick={() => handleEdit(e)}>✏️ Edit</button>
                      <button className="btn btn-delete" onClick={() => handleDelete(e.id)}>🗑 Delete</button>
                      <button className="btn btn-start" onClick={() => handleSetDate(e, "Start")}>▶ Start</button>
                    </>
                  )}
                  {status === "Ongoing" && (
                    <button className="btn btn-end" onClick={() => handleSetDate(e, "End")}>⏹ End</button>
                  )}
                  {status === "Ended" && <span style={{ color: "gray" }}>🔒 Closed</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default Elections;