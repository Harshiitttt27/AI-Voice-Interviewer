import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

import {
  Clock,
  CheckCircle2,
  BarChart3,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function InterviewHistory() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchSessions = async () => {
    try {
      const res = await api.get("/interview/sessions");

      const completedSessions = (res.data.sessions || []).filter(
        (session: any) => session.status === "completed"
      );

      setSessions(completedSessions);
    } catch (err) {
      console.log(err);
      alert("Failed to load interview history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-violet-950 to-cyan-950 text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">
            Interview History
          </h1>

          <p className="text-gray-400 mt-2">
            View all completed AI interview sessions
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg animate-pulse">
              Loading interview history...
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <Sparkles className="mx-auto mb-4 text-violet-400" size={40} />

            <h2 className="text-2xl font-semibold mb-2">
              No Completed Interviews
            </h2>

            <p className="text-gray-400">
              Complete an interview to see history here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  {/* Left Side */}
                  <div>
                    <h2 className="text-xl font-semibold">
                      {session.role}
                    </h2>

                    <p className="text-sm text-gray-400 mt-1">
                      Level: {session.level}
                    </p>

                    <div className="flex flex-wrap gap-6 mt-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        {session.current_question_no}/
                        {session.max_questions} Questions
                      </div>

                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle2 size={16} />
                        Completed
                      </div>
                    </div>
                  </div>

                  {/* Right Side */}
                  <div className="flex items-center">
                    <button
                      onClick={() =>
                        navigate(`/report/${session.id}`)
                      }
                      className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 transition flex items-center gap-2"
                    >
                      <BarChart3 size={18} />
                      View Report
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}