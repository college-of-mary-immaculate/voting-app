import { Navigate } from "react-router-dom";

function PrivateRoute({ children, roles=[] }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) return <Navigate to="/" replace />;

  if (roles.length > 0 && !roles.includes(user.role)) {
    alert("Access denied: You are not authorized for this page.");
    localStorage.clear();
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PrivateRoute;