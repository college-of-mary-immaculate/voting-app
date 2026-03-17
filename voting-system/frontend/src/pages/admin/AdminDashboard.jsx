import { useState, useEffect } from "react";
import Elections from "./Elections";
import Positions from "./Positions";
import Candidates from "./Candidates";
import AdminLayout from "../../components/AdminLayout";

function AdminDashboard() {
  const [elections, setElections] = useState([]);
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const token = localStorage.getItem("token");

  const fetchAllData = async () => {
    try {
      const resE = await fetch("http://localhost:3000/api/admin/elections", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setElections(await resE.json());

      const resP = await fetch("http://localhost:3000/api/admin/positions", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPositions(await resP.json());

      const resC = await fetch("http://localhost:3000/api/admin/candidates", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCandidates(await resC.json());
    } catch (error) {
      console.error("Error loading admin data:", error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [refreshCounter]);

  const refresh = () => setRefreshCounter(prev => prev + 1);

  return (
    <AdminLayout>

      <h1>Admin Dashboard</h1>

      {/* Dashboard Cards */}
      <div className="dashboard-cards">

        <div className="card">
          <h3>Total Elections</h3>
          <p>{elections.length}</p>
        </div>

        <div className="card">
          <h3>Total Positions</h3>
          <p>{positions.length}</p>
        </div>

        <div className="card">
          <h3>Total Candidates</h3>
          <p>{candidates.length}</p>
        </div>

      </div>

      {/* Elections Section */}
      <div className="section">
        <h2>Elections</h2>
        <Elections elections={elections} refresh={refresh}/>
      </div>

      {/* Positions Section */}
      <div className="section">
        <h2>Positions</h2>
        <Positions positions={positions} elections={elections} refresh={refresh}/>
      </div>

      {/* Candidates Section */}
      <div className="section">
        <h2>Candidates</h2>
        <Candidates candidates={candidates} positions={positions} elections={elections} refresh={refresh}/>
      </div>

    </AdminLayout>
  );
}

export default AdminDashboard;