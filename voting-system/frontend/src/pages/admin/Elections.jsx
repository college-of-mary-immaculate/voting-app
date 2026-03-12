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
      alert("Please fill all fields");
      return;
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
          end_date: new Date().toISOString().split("T")[0],
        }),
      }
    );

    const data = await res.json();
    alert(data.message);

    refresh();
  };

  return (
    <div>
      <h3>Elections</h3>

      <div style={{ marginBottom: "15px" }}>
        <input
          placeholder="Title"
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

        <button onClick={handleAddOrUpdate}>
          {editId ? "Update Election" : "Add Election"}
        </button>

        {editId && <button onClick={resetForm}>Cancel</button>}
      </div>

      <table border="1" cellPadding="5">
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
                <td>{e.title}</td>
                <td>{e.start_date}</td>
                <td>{e.end_date}</td>
                <td>{status}</td>

                <td>
                  {status === "Upcoming" && (
                    <>
                      <button onClick={() => handleEdit(e)}>Edit</button>
                      <button onClick={() => handleDelete(e.id)}>
                        Delete
                      </button>
                    </>
                  )}

                  {status === "Ongoing" && (
                    <button onClick={() => handleEndElection(e)}>
                      End Election
                    </button>
                  )}

                  {status === "Ended" && (
                    <span style={{ color: "gray" }}>Closed</span>
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