import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

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
  const [uploading, setUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

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
    const res = await api.get("/interview/dashboard");
    setDashboard(res.data);
  } catch (err) {
    console.log(err);
  }
};

  // ================= SESSIONS =================
  const fetchSessions = async () => {
    try {
      const res = await api.get("/interview/sessions");
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
        const res = await api.post("/interview/start", {
      role: "Software Engineer",
      level: "beginner",
    });

      navigate(`/interview/${res.data.session_id}`);
    } catch (err) {
      alert("Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  // ================= RESUME UPLOAD =================

  const uploadResume = async () => {
    if (!resumeFile) {
      alert("Please select a resume");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", resumeFile);

       const res = await api.post(
      "/resume/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    
      navigate(`/resume-interview/${res.data.session_id}`);
    } catch (err) {
      console.log(err);
      alert("Resume upload failed");
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-violet-950 to-cyan-950 text-white">
      <Navbar />

      <div className="px-4 md:px-12 py-8">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Welcome back 👋</h1>
          <p className="text-gray-300 mt-2">AI Interview Platform Dashboard</p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
            <Activity className="text-cyan-400 mb-2" />
            <p className="text-xs text-gray-400">Total Interviews</p>
            <h2>{dashboard?.total_interviews ?? 0}</h2>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
            <TrendingUp className="text-green-400 mb-2" />
            <p className="text-xs text-gray-400">Avg Score</p>
            <h2>{dashboard?.avg_score ?? 0}%</h2>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
            <CheckCircle className="text-violet-400 mb-2" />
            <p className="text-xs text-gray-400">Completed</p>
            <h2>{dashboard?.completed ?? 0}</h2>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
            <Award className="text-yellow-400 mb-2" />
            <p className="text-xs text-gray-400">Active</p>
            <h2>{dashboard?.active ?? 0}</h2>
          </div>
        </div>

        {/* ACTION CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* START INTERVIEW */}
          <div className="p-6 rounded-2xl bg-white/10 border border-white/10">
            <Brain className="text-cyan-400" />
            <h2 className="text-xl mt-3">Start Interview</h2>
            <p className="text-sm text-gray-300 mt-2">
              AI voice interview system
            </p>

            <button
              onClick={startInterview}
              className="mt-4 w-full py-2 rounded-xl bg-cyan-600"
            >
              {loading ? "Starting..." : "Start Now"}
            </button>
          </div>

          {/* RESUME UPLOAD */}
          <div className="p-6 rounded-2xl bg-white/10 border border-white/10">
            <Upload className="text-violet-400" />
            <h2 className="text-xl mt-3">Resume Analysis</h2>
            <p className="text-sm text-gray-300 mt-2">
              Upload resume for AI interview personalization
            </p>

            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              className="mt-3 text-sm"
            />

            <button
              onClick={uploadResume}
              className="mt-4 w-full py-2 rounded-xl bg-violet-600"
            >
              {uploading ? "Processing..." : "Upload & Start"}
            </button>
          </div>

          {/* HISTORY */}
          <div className="p-6 rounded-2xl bg-white/10 border border-white/10">
            <History className="text-green-400" />
            <h2 className="text-xl mt-3">Interview History</h2>
            <p className="text-sm text-gray-300 mt-2">View past interviews</p>

            <button
              onClick={() => navigate("/history")}
              className="mt-4 w-full py-2 rounded-xl bg-green-600"
            >
              View History
            </button>
          </div>
        </div>

        {/* SESSIONS */}
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
                  <p>
                    {s.role} ({s.level})
                  </p>
                  <p className="text-xs text-gray-400">
                    {s.current_question_no}/{s.max_questions}
                  </p>
                </div>

                <span className="text-xs px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300">
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
