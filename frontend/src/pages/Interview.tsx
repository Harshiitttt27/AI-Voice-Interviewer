import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Mic, MicOff, Loader2 } from "lucide-react";

export default function Interview() {
  const [session, setSession] = useState<any>(null);
  const [question, setQuestion] = useState<any>(null);

  const [role, setRole] = useState("");
  const [level, setLevel] = useState("Junior");

  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ✅ RESET STATE ON PAGE LOAD (FIX AUTO FILL BUG)
  useEffect(() => {
    setRole("");
    setLevel("Junior");
    setSession(null);
    setQuestion(null);
  }, []);

  // ================= START INTERVIEW =================
  const startInterview = async () => {
    try {
      if (!role.trim()) {
        alert("Please enter role");
        return;
      }

      setLoading(true);

      console.log("Sending:", { role, level });

      const res = await axios.post(
        "http://127.0.0.1:8000/interview/start",
        {
          role: role.trim(),
          level,
        },
        { headers }
      );

      setSession({
        session_id: res.data.session_id,
      });

      setQuestion({
        question_id: res.data.question_id,
        question: res.data.question,
      });

      speak(res.data.question);
    } catch (err) {
      console.log(err);
      alert("Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  // ================= TEXT TO SPEECH =================
  const speak = (text: string) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = 1;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
  };

  // ================= RECORDING =================
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    audioChunks.current = [];

    mediaRecorder.ondataavailable = (e) => {
      audioChunks.current.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, {
        type: "audio/wav",
      });

      await submitAnswer(audioBlob);
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  // ================= SUBMIT ANSWER =================
  const submitAnswer = async (audioBlob: Blob) => {
    try {
      setProcessing(true);

      const formData = new FormData();
      formData.append("session_id", String(session.session_id));
      formData.append("question_id", String(question.question_id));
      formData.append("file", audioBlob, "answer.wav");

      const res = await axios.post(
        "http://127.0.0.1:8000/interview/answer",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.interview_completed) {
        speak("Interview completed. Great job!");
        setSession(null);
        setQuestion(null);
        setRole("");
        setLevel("Junior");
        return;
      }

      const next = res.data.next_question;
      setQuestion(next);
      speak(next.question);
    } catch (err) {
      console.log(err);
      alert("Error submitting answer");
    } finally {
      setProcessing(false);
    }
  };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-violet-950 to-cyan-950 text-white">

      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 text-transparent bg-clip-text">
            AI Voice Interview
          </h1>
          <p className="text-gray-400 mt-2">
            Speak naturally. Let AI evaluate your responses.
          </p>
        </div>

        {/* SETUP */}
        {!session && (
          <div className="flex justify-center">
            <div className="w-full max-w-xl bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-2xl space-y-5">

              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Enter role (e.g. Software Developer)"
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10"
              />

              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full p-3 rounded-xl bg-black/40 border border-white/10"
              >
                <option value="Junior">Junior</option>
                <option value="Mid">Mid</option>
                <option value="Senior">Senior</option>
              </select>

              <button
                onClick={startInterview}
                disabled={loading || !role.trim()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600"
              >
                {loading ? "Starting..." : "Start Interview"}
              </button>

            </div>
          </div>
        )}

        {/* INTERVIEW */}
        {session && question && (
          <div className="space-y-10">

            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <p className="text-gray-400 text-sm">AI Interviewer</p>
              <h2 className="text-xl mt-2">{question.question}</h2>
            </div>

            <div className="flex justify-center">
              {!recording ? (
                <button
                  onClick={startRecording}
                  className="px-6 py-3 bg-green-600 rounded-full flex items-center gap-2"
                >
                  <Mic size={18} />
                  Start Answer
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="px-6 py-3 bg-red-600 rounded-full flex items-center gap-2"
                >
                  <MicOff size={18} />
                  Stop Recording
                </button>
              )}
            </div>

            {processing && (
              <div className="text-center text-gray-300 flex justify-center gap-2">
                <Loader2 className="animate-spin" />
                Evaluating...
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}