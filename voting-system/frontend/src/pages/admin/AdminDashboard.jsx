import { useState, useEffect } from "react";
import Elections from "./Elections";
import Positions from "./Positions";
import Candidates from "./Candidates";

function AdminDashboard() {
  const [elections, setElections] = useState([]);
  const [positions, setPositions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [refreshCounter, setRefreshCounter] = useState(0); // increment to refresh all

  const token = localStorage.getItem("token");

  const fetchAllData = async () => {
    const resE = await fetch("http://localhost:3000/api/admin/elections", { headers: { Authorization: `Bearer ${token}` } });
    setElections(await resE.json());

    const resP = await fetch("http://localhost:3000/api/admin/positions", { headers: { Authorization: `Bearer ${token}` } });
    setPositions(await resP.json());

    const resC = await fetch("http://localhost:3000/api/admin/candidates", { headers: { Authorization: `Bearer ${token}` } });
    setCandidates(await resC.json());
  };

  useEffect(() => {
    fetchAllData();
  }, [refreshCounter]);

  // function to trigger refresh
  const refresh = () => setRefreshCounter(prev => prev + 1);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>

      <div style={{ marginTop: "30px" }}>
        <Elections elections={elections} refresh={refresh} />
      </div>

      <div style={{ marginTop: "30px" }}>
        <Positions positions={positions} elections={elections} refresh={refresh} />
      </div>

      <div style={{ marginTop: "30px" }}>
        <Candidates candidates={candidates} positions={positions} elections={elections} refresh={refresh} />
      </div>
    </div>
  );
}

export default AdminDashboard;