import { useState, useEffect } from "react";
import {
  createElection,
  updateElection,
  deleteElection,
  startElection,
  endElection,
} from "../../api/api";
import { getSocket, emitWhenConnected } from "../../api/socket";

function Elections({ elections, refresh }) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editId, setEditId] = useState(null);
  const [socketStatus, setSocketStatus] = useState("Disconnected");

  const socket = getSocket();

  // ---------- Helpers ----------
  const getStatus = (start, end) => {
    const now = new Date();
    const startD = new Date(start);
    const endD = new Date(end);

    if (now < startD) return "Upcoming";
    if (now >= startD && now <= endD) return "Ongoing";
    if (now > endD) return "Ended";
    return "Unknown";
  };

  const formatDateTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  };

  const toMySQLDateTime = (value) => (value ? value.replace("T", " ") + ":00" : null);

  const resetForm = () => {
    setTitle("");
    setStartDate("");
    setEndDate("");
    setEditId(null);
  };

  // ---------- Handlers ----------
  const handleAddOrUpdate = async () => {
    if (!title || !startDate || !endDate) return alert("Please fill all fields");

    const payload = {
      title,
      start_date: toMySQLDateTime(startDate),
      end_date: toMySQLDateTime(endDate),
    };

    try {
      if (editId) await updateElection(editId, payload);
      else await createElection(payload);

      alert("Success");
      resetForm();
      refresh();
      emitWhenConnected("election_update");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (election) => {
    setEditId(election.id);
    setTitle(election.title);
    setStartDate(formatDateTime(election.start_date));
    setEndDate(formatDateTime(election.end_date));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this election?")) return;
    try {
      await deleteElection(id);
      alert("Deleted");
      refresh();
      emitWhenConnected("election_update");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleStartElection = async (election) => {
    if (!window.confirm("Start this election now?")) return;
    try {
      await startElection(election.id);
      alert("Election started");
      refresh();
      emitWhenConnected("election_started", { electionId: election.id });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEndElection = async (election) => {
    if (!window.confirm("End this election now?")) return;
    try {
      await endElection(election.id);
      alert("Election ended");
      refresh();
      emitWhenConnected("election_ended", { electionId: election.id });
    } catch (err) {
      alert(err.message);
    }
  };

  // ---------- Socket Listeners ----------
  useEffect(() => {
    if (!socket.connected) socket.connect();

    const refreshHandler = () => refresh();

    socket.on("election_update", refreshHandler);
    socket.on("election_started", refreshHandler);
    socket.on("election_ended", refreshHandler);

    socket.on("connect", () => setSocketStatus("Connected"));
    socket.on("disconnect", () => setSocketStatus("Disconnected"));

    return () => {
      socket.off("election_update", refreshHandler);
      socket.off("election_started", refreshHandler);
      socket.off("election_ended", refreshHandler);
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [refresh, socket]);

  // ---------- Render ----------
  return (
    <div>
      <div style={{ marginBottom: "15px" }}>
        <div>Socket status: {socketStatus}</div>
        <input
          placeholder="Election Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="datetime-local"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="datetime-local"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button onClick={handleAddOrUpdate}>{editId ? "Update" : "Add"}</button>
        {editId && <button onClick={resetForm}>Cancel</button>}
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
                <td>{e.title}</td>
                <td>{new Date(e.start_date).toLocaleString()}</td>
                <td>{new Date(e.end_date).toLocaleString()}</td>
                <td>{status}</td>
                <td>
                  {status === "Upcoming" && (
                    <>
                      <button onClick={() => handleEdit(e)}>Edit</button>
                      <button onClick={() => handleDelete(e.id)}>Delete</button>
                      <button onClick={() => handleStartElection(e)}>Start</button>
                    </>
                  )}
                  {status === "Ongoing" && (
                    <button onClick={() => handleEndElection(e)}>End</button>
                  )}
                  {status === "Ended" && <span>Closed</span>}
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