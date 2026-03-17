import { Link } from "react-router-dom";

function AdminLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      
      {/* Sidebar */}
      <div
        style={{
          width: "220px",
          background: "#1e293b",
          color: "white",
          padding: "20px",
        }}
      >
        <h2>Voting Admin</h2>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            marginTop: "20px",
          }}
        >
          <a href="#dashboard" style={linkStyle}>Dashboard</a>
          <a href="#elections" style={linkStyle}>Elections</a>
          <a href="#positions" style={linkStyle}>Positions</a>
          <a href="#candidates" style={linkStyle}>Candidates</a>
        </nav>

        <button
          style={{
            marginTop: "30px",
            background: "#ef4444",
            color: "white",
            border: "none",
            padding: "10px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: "30px",
          background: "#f1f5f9",
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
  cursor: "pointer",
};

export default AdminLayout;