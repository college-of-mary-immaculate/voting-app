import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import PublicRoute from "./components/PublicRoute";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Vote from "./pages/Vote";
import Results from "./pages/Results";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  return (
    <BrowserRouter>
      <Navbar user={user} setUser={setUser} />

      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <PublicRoute user={user}>
              <Login setUser={setUser} />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute user={user}>
              <Register setUser={setUser} />
            </PublicRoute>
          }
        />

        {/* Voter routes */}
        <Route
          path="/vote"
          element={
            <PrivateRoute roles={["voter"]} user={user}>
              <Vote />
            </PrivateRoute>
          }
        />

        {/* Results for both roles */}
        <Route
          path="/results"
          element={
            <PrivateRoute roles={["voter", "admin"]} user={user}>
              <Results />
            </PrivateRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute roles={["admin"]} user={user}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;