import { Routes, Route, Navigate } from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Interview from "./pages/Interview";
import ResumeInterview from "./pages/ResumeInterview";
import InterviewHistory from "./pages/InterviewHistory";
import InterviewReport from "./pages/InterviewReport";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signup" replace />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/interview/:sessionId" element={<Interview />} />
      <Route path="/interviews" element={<Interview />} />
      <Route path="/resume-interview/:sessionId" element={<ResumeInterview />} />
      <Route path="/history" element={<InterviewHistory />} />
      <Route path="/report/:id" element={<InterviewReport />} />
    </Routes>
  );
}