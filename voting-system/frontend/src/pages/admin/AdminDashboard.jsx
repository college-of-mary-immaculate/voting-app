import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import Elections from "./Elections";
import Positions from "./Positions";
import Candidates from "./Candidates";

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
      <div id="dashboard">
        <h2>Admin Dashboard</h2>

        <h3>Total Elections: {elections.length}</h3>
        <h3>Total Positions: {positions.length}</h3>
        <h3>Total Candidates: {candidates.length}</h3>
      </div>

      <div id="elections" style={{ marginTop: "40px" }}>
        <h2>Elections</h2>
        <Elections elections={elections} refresh={refresh} />
      </div>

      <div id="positions" style={{ marginTop: "40px" }}>
        <h2>Positions</h2>
        <Positions
          positions={positions}
          elections={elections}
          refresh={refresh}
        />
      </div>

      <div id="candidates" style={{ marginTop: "40px" }}>
        <h2>Candidates</h2>
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