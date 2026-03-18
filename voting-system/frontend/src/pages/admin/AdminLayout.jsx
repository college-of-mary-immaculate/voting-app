import { Link } from "react-router-dom";
import "./AdminLayout.css";

function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <h2>Voting Admin</h2>
      </div>

      <div className="admin-content">{children}</div>
    </div>
  );
}

export default AdminLayout;