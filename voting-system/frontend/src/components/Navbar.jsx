import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link
          to={user ? (user.role === "admin" ? "/admin" : "/vote") : "/"}
          className="navbar-brand"
        >
          <span className="navbar-logo">🗳</span>
          <span>Online Voting System</span>
        </Link>
      </div>

      <div className="navbar-right">
        {user ? (
          <>
            {user.role === "admin" && (
              <Link to="/admin" className="nav-link">
                Admin Dashboard
              </Link>
            )}

            {user.role === "voter" && (
              <Link to="/vote" className="nav-link">
                Vote
              </Link>
            )}

            <Link to="/results" className="nav-link">
              Results
            </Link>

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="nav-link">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}