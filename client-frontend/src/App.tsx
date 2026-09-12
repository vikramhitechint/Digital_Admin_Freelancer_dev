import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import ProjectsPublish from "./pages/ProjectsPublish";
import ViewProject from "./components/projectpublish/ViewProject";
import ProjectsOngoing from "./pages/ProjectOngoing";
import ViewOngoingProject from "./components/projectongoing/ViewOngoingProject";
import ProjectChat from "./components/chatarea/ProjectChat";
import ProjectsComplete from "./pages/ProjectComplete";
import ViewCompleteProject from "./components/projectcomplete/ViewCompleteProject";
import Notifications from "./pages/Notification";
import Settings from "./pages/Settings";

// ============================================================================
// Protected Route Component: Only allows logged-in users
// ============================================================================
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const authUser = JSON.parse(localStorage.getItem("htge_auth_user") || "null");
  
  if (!authUser || !authUser.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// ============================================================================
// Main App Component with Routes
// ============================================================================
export default function App() {
  const authUser = JSON.parse(localStorage.getItem("htge_auth_user") || "null");
  const isLoggedIn = authUser && authUser.isLoggedIn;

  return (
    <Routes>
      {/* 1. Root Route: Goes directly to /login first (or /dashboard if already logged in) */}
      <Route
        path="/"
        element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />}
      />

      {/* 2. Login Page Route (Standalone, no Layout) */}
      <Route
        path="/login"
        element={
          isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />

      {/* 3. Protected Routes (Wrapped inside Layout) */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Projects Sub-routes */}
        <Route path="/projects">
          <Route index element={<Navigate to="/projects/publish" replace />} />

          {/* Published Projects */}
          <Route path="publish" element={<ProjectsPublish />} />
          <Route path="publish/:id" element={<ViewProject />} />
          <Route path="publish/:id/chat/:freelancerId" element={<ProjectChat />} />

          {/* Ongoing Projects */}
          <Route path="ongoing" element={<ProjectsOngoing />} />
          <Route path="ongoing/:id" element={<ViewOngoingProject />} />
          <Route path="ongoing/:id/chat/:freelancerId" element={<ProjectChat />} />

          {/* Completed Projects */}
          <Route path="complete" element={<ProjectsComplete />} />
          <Route path="complete/:id" element={<ViewCompleteProject />} />
        </Route>

        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* 4. Catch-all fallback */}
      <Route
        path="*"
        element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}