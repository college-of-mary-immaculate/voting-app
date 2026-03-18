import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import Elections from "./Elections";
import Positions from "./Positions";
import Candidates from "./Candidates";
import "./AdminLayout.css";

function AdminDashboard() {
  const [elections, setElections] = useState([]);
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const token = localStorage.getItem("token");

  const fetchAllData = async () => {
    try {
      const resE = await fetch("http://localhost:3000/api/admin/elections", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setElections(await resE.json());

      const resP = await fetch("http://localhost:3000/api/admin/positions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPositions(await resP.json());

      const resC = await fetch("http://localhost:3000/api/admin/candidates", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCandidates(await resC.json());
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [refreshCounter]);

  const refresh = () => setRefreshCounter((prev) => prev + 1);

  return (
    <AdminLayout>
      {/* Dashboard stats */}
      <div id="dashboard" className="admin-section">
        <h2 className="section-heading">Admin Dashboard</h2>
        <div className="dashboard-card">Total Elections: {elections.length}</div>
        <div className="dashboard-card">Total Positions: {positions.length}</div>
        <div className="dashboard-card">Total Candidates: {candidates.length}</div>
      </div>

      {/* Elections Section */}
      <div id="elections" className="admin-section">
        <h2 className="section-heading">Elections</h2>
        <Elections elections={elections} refresh={refresh} />
      </div>

      {/* Positions Section */}
      <div id="positions" className="admin-section">
        <h2 className="section-heading">Positions</h2>
        <Positions
          positions={positions}
          elections={elections}
          refresh={refresh}
        />
      </div>

      {/* Candidates Section */}
      <div id="candidates" className="admin-section">
        <h2 className="section-heading">Candidates</h2>
        <Candidates
          candidates={candidates}
          positions={positions}
          elections={elections}
          refresh={refresh}
        />
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;