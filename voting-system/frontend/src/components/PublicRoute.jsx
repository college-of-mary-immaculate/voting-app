import { Navigate } from "react-router-dom";

export default function PublicRoute({ children, user }) {
  if (user) {
    // Redirect logged-in users based on role
    return <Navigate to={user.role === "admin" ? "/admin" : "/vote"} replace />;
  }
  return children; // Not logged in, show page
}