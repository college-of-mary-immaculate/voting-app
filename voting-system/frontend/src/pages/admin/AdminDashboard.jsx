import { useState, useEffect } from "react";
import AdminLayout from "./AdminLayout";
import Elections from "./Elections";
import Positions from "./Positions";
import Candidates from "./Candidates";
import {
  getAdminElections,
  getAdminPositions,
  getAdminCandidates,
} from "../../api/api";
import "./AdminLayout.css";

function AdminDashboard() {
  const [elections, setElections] = useState([]);
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const fetchAllData = async () => {
    try {
      const [electionsData, positionsData, candidatesData] =
        await Promise.all([
          getAdminElections(),
          getAdminPositions(),
          getAdminCandidates(),
        ]);

      setElections(electionsData);
      setPositions(positionsData);
      setCandidates(candidatesData);
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

        <div className="dashboard-card">
          Total Elections: {elections.length}
        </div>

        <div className="dashboard-card">
          Total Positions: {positions.length}
        </div>

        <div className="dashboard-card">
          Total Candidates: {candidates.length}
        </div>
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