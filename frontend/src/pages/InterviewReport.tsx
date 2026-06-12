import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";
import { Brain, MessageSquare, Mic, Trophy } from "lucide-react";

export default function InterviewReport() {
  const { id } = useParams();

  const [report, setReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      const res = await api.get(`/interview/session/${id}/report`);

      setReport(res.data.report || []);
    } catch (err) {
      console.log(err);
      alert("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const avgTechnical =
    report.length > 0
      ? (
          report.reduce((a, b) => a + b.technical_score, 0) / report.length
        ).toFixed(1)
      : 0;

  const avgCommunication =
    report.length > 0
      ? (
          report.reduce((a, b) => a + b.communication_score, 0) / report.length
        ).toFixed(1)
      : 0;

  const avgConfidence =
    report.length > 0
      ? (
          report.reduce((a, b) => a + b.confidence_score, 0) / report.length
        ).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-violet-950 to-cyan-950 text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Interview Report</h1>

        {loading ? (
          <div className="text-center py-20">Loading Report...</div>
        ) : (
          <>
            {/* Summary Cards */}

            <div className="grid md:grid-cols-3 gap-5 mb-8">
              <div className="bg-white/10 rounded-2xl p-5">
                <Brain className="mb-3 text-cyan-400" />
                <p className="text-gray-400 text-sm">Technical Score</p>
                <h2 className="text-3xl font-bold">{avgTechnical}</h2>
              </div>

              <div className="bg-white/10 rounded-2xl p-5">
                <MessageSquare className="mb-3 text-green-400" />
                <p className="text-gray-400 text-sm">Communication</p>
                <h2 className="text-3xl font-bold">{avgCommunication}</h2>
              </div>

              <div className="bg-white/10 rounded-2xl p-5">
                <Mic className="mb-3 text-yellow-400" />
                <p className="text-gray-400 text-sm">Confidence</p>
                <h2 className="text-3xl font-bold">{avgConfidence}</h2>
              </div>
            </div>

            {/* Question Wise Report */}

            <div className="space-y-4">
              {report.map((item, index) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-semibold text-lg">
                      Question {index + 1}
                    </h2>

                    <Trophy className="text-yellow-400" />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">Technical</p>
                      <p className="text-xl font-bold">
                        {item.technical_score}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm">Communication</p>
                      <p className="text-xl font-bold">
                        {item.communication_score}
                      </p>
                    </div>

                    <div>
                      <p className="text-gray-400 text-sm">Confidence</p>
                      <p className="text-xl font-bold">
                        {item.confidence_score}
                      </p>
                    </div>
                  </div>

                  <div className="bg-black/30 rounded-xl p-4">
                    <p className="text-gray-300">{item.feedback}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
