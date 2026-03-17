import { Link } from "react-router-dom";

function AdminLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>

      {/* Sidebar */}
      <div
        style={{
          width: "220px",
          background: "#1e293b",
          color: "white",
          padding: "20px"
        }}
      >
        <h2 style={{ marginBottom: "30px" }}>Voting Admin</h2>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px"
          }}
        >
          <Link style={linkStyle} to="/admin">Dashboard</Link>
          <Link style={linkStyle} to="/admin/elections">Elections</Link>
          <Link style={linkStyle} to="/admin/positions">Positions</Link>
          <Link style={linkStyle} to="/admin/candidates">Candidates</Link>
        </nav>

        {/* Logout Button */}
        <button
          style={{
            marginTop: "30px",
            padding: "8px",
            border: "none",
            borderRadius: "5px",
            background: "#ef4444",
            color: "white",
            cursor: "pointer"
          }}
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          background: "#f1f5f9",
          padding: "30px"
        }}
      >
        {children}
      </div>

    </div>
  );
}

const linkStyle = {
  color: "white",
  textDecoration: "none",
  padding: "8px",
  borderRadius: "5px"
};

export default AdminLayout;