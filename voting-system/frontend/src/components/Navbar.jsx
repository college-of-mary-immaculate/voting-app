import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
      {user ? (
        <>
          {user.role === "admin" && (
            <>
              <Link to="/admin" style={{ marginRight: 10 }}>Admin Dashboard</Link>
            </>
          )}
          {user.role === "voter" && (
            <Link to="/vote" style={{ marginRight: 10 }}>Vote</Link>
          )}
          <Link to="/results" style={{ marginRight: 10 }}>Results</Link>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/" style={{ marginRight: 10 }}>Login</Link>
          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}