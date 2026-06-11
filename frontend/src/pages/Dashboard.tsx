import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  Brain,
  Upload,
  History,
  Sparkles,
  TrendingUp,
  Activity,
  Award,
  CheckCircle,
} from "lucide-react";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);

  const [dashboard, setDashboard] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ================= DASHBOARD STATS =================
  const fetchDashboard = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/interview/dashboard",
        { headers }
      );
      setDashboard(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= SESSIONS =================
  const fetchSessions = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/interview/sessions",
        { headers }
      );
      setSessions(res.data.sessions);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchSessions();
  }, []);

  // ================= START INTERVIEW =================
  const startInterview = async () => {
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:8000/interview/start",
        {
          role: "Software Engineer",
          level: "beginner",
        },
        { headers }
      );

      const sessionId = res.data.session_id;

      // 🔥 IMPORTANT: redirect to interview page
      navigate(`/interview/${sessionId}`);

    } catch (err) {
      alert("Failed to start interview");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-violet-950 to-cyan-950 text-white">

      <Navbar />

      <div className="px-4 md:px-12 py-8">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">
            Welcome back 👋
          </h1>
          <p className="text-gray-300 mt-2">
            AI Interview Platform Dashboard
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
            <Activity className="text-cyan-400 mb-2" />
            <p className="text-xs text-gray-400">Total Interviews</p>
            <h2 className="text-xl font-bold">
              {dashboard?.total_interviews ?? 0}
            </h2>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
            <TrendingUp className="text-green-400 mb-2" />
            <p className="text-xs text-gray-400">Avg Score</p>
            <h2 className="text-xl font-bold text-cyan-300">
              {dashboard?.avg_score ?? 0}%
            </h2>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
            <CheckCircle className="text-violet-400 mb-2" />
            <p className="text-xs text-gray-400">Completed</p>
            <h2 className="text-xl font-bold text-violet-300">
              {dashboard?.completed ?? 0}
            </h2>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
            <Award className="text-yellow-400 mb-2" />
            <p className="text-xs text-gray-400">Active</p>
            <h2 className="text-xl font-bold text-yellow-300">
              {dashboard?.active ?? 0}
            </h2>
          </div>

        </div>

        {/* ACTION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* START INTERVIEW */}
          <div className="p-6 rounded-2xl bg-white/10 border border-white/10">
            <Brain className="text-cyan-400" />

            <h2 className="text-xl font-semibold mt-3">
              Start Interview
            </h2>

            <p className="text-sm text-gray-300 mt-2">
              AI voice interview with evaluation engine
            </p>

            <button
              onClick={startInterview}
              className="mt-4 w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500"
            >
              {loading ? "Starting..." : "Start Now"}
            </button>
          </div>

          {/* RESUME */}
          <div className="p-6 rounded-2xl bg-white/10 border border-white/10">
            <Upload className="text-violet-400" />

            <h2 className="text-xl font-semibold mt-3">
              Resume Analysis
            </h2>

            <p className="text-sm text-gray-300 mt-2">
              Upload resume for AI personalization
            </p>

            <button className="mt-4 w-full py-2 rounded-xl bg-violet-600">
              Upload Resume
            </button>
          </div>

          {/* HISTORY */}
          <div className="p-6 rounded-2xl bg-white/10 border border-white/10">
            <History className="text-green-400" />

            <h2 className="text-xl font-semibold mt-3">
              Interview History
            </h2>

            <p className="text-sm text-gray-300 mt-2">
              View past interviews
            </p>

            <button className="mt-4 w-full py-2 rounded-xl bg-green-600">
              View History
            </button>
          </div>

        </div>

        {/* SESSIONS LIST */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="text-yellow-400" />
            Recent Sessions
          </h2>

          <div className="space-y-3">
            {sessions?.map((s: any) => (
              <div
                key={s.id}
                className="p-4 rounded-xl bg-white/5 border border-white/10 flex justify-between"
              >
                <div>
                  <p className="font-semibold">
                    {s.role} ({s.level})
                  </p>
                  <p className="text-xs text-gray-400">
                    {s.current_question_no}/{s.max_questions}
                  </p>
                </div>

                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    s.status === "completed"
                      ? "bg-green-500/20 text-green-300"
                      : "bg-yellow-500/20 text-yellow-300"
                  }`}
                >
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}