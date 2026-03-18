import { useState } from "react";

function Elections({ elections, refresh }) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
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

  const resetForm = () => {
    setTitle("");
    setStartDate("");
    setEndDate("");
    setEditId(null);
  };

  const handleAddOrUpdate = async () => {
    if (!title || !startDate || !endDate) {
      return alert("Please fill all fields");
    }

    const url = editId
      ? `http://localhost:3000/api/admin/elections/${editId}`
      : "http://localhost:3000/api/admin/elections";

    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        start_date: startDate,
        end_date: endDate,
      }),
    });

    const data = await res.json();
    alert(data.message);

    resetForm();
    refresh();
  };

  const handleEdit = (election) => {
    setEditId(election.id);
    setTitle(election.title);
    setStartDate(election.start_date);
    setEndDate(election.end_date);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this election?")) return;

    const res = await fetch(
      `http://localhost:3000/api/admin/elections/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    alert(data.message);
    refresh();
  };

  const handleEndElection = async (election) => {
    if (!window.confirm("End this election now?")) return;

    const res = await fetch(
      `http://localhost:3000/api/admin/elections/${election.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: election.title,
          start_date: election.start_date,
          end_date: new Date().toISOString(),
        }),
      }
    );

    const data = await res.json();
    alert(data.message);
    refresh();
  };

  const handleStartElection = async (election) => {
    if (!window.confirm("Start this election now?")) return;

    const res = await fetch(
      `http://localhost:3000/api/admin/elections/${election.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: election.title,
          start_date: new Date().toISOString(),
          end_date: election.end_date,
        }),
      }
    );

    const data = await res.json();
    alert(data.message);
    refresh();
  };

  return (
    <div>

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

                <td data-label="Start">
                  {new Date(e.start_date).toLocaleString()}
                </td>

                <td data-label="End">
                  {new Date(e.end_date).toLocaleString()}
                </td>

                <td data-label="Status">
                  <span className={`status ${status.toLowerCase()}`}>
                    {status}
                  </span>
                </td>

                <td data-label="Actions">
                  {status === "Upcoming" && (
                    <>
                      <button
                        className="btn btn-edit"
                        onClick={() => handleEdit(e)}
                      >
                        ✏️ Edit
                      </button>

                      <button
                        className="btn btn-delete"
                        onClick={() => handleDelete(e.id)}
                      >
                        🗑 Delete
                      </button>

                      <button
                        className="btn btn-start"
                        onClick={() => handleStartElection(e)}
                      >
                        ▶ Start
                      </button>
                    </>
                  )}

                  {status === "Ongoing" && (
                    <button
                      className="btn btn-end"
                      onClick={() => handleEndElection(e)}
                    >
                      ⏹ End
                    </button>
                  )}

                  {status === "Ended" && (
                    <span style={{ color: "gray" }}>🔒 Closed</span>
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

export default Elections;