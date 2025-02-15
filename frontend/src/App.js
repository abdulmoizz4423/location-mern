import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/common/Home";
import AdminDashboard from "./components/admin/AdminDashboard";
import CitizenDashboard from "./components/citizen/CitizenDashboard";
import RescuerDashboard from "./components/rescuer/RescuerDashboard";
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/citizen"
          element={
            <ProtectedRoute allowedRoles={["Citizen"]}>
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rescuer"
          element={
            <ProtectedRoute allowedRoles={["Rescuer"]}>
              <RescuerDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
