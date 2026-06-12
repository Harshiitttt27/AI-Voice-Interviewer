import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";

export default function ResumeInterview() {
  const { sessionId } = useParams();

  const [session, setSession] = useState<any>(null);
  const [question, setQuestion] = useState<any>(null);

  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // ================= INIT RESUME FLOW =================
  useEffect(() => {
    if (sessionId) {
      startFromResume(sessionId);
    }
  }, [sessionId]);

  // ================= LOAD RESUME CONTEXT + START =================
  const startFromResume = async (id: string) => {
    try {
      setLoading(true);

      // 1. Get resume context
      const res = await api.get(`/resume/session/${id}`);

      const context = res.data.resume_context;

      // 2. Start interview using extracted role/level
      const start = await api.post("/interview/start", {
        role: context?.suggested_role || "Software Engineer",
        level: context?.experience_level || "Junior",
      });

      const sessionData = {
        session_id: start.data.session_id,
      };

      setSession(sessionData);

      const firstQuestion = {
        question_id: start.data.question_id,
        question: start.data.question,
      };

      setQuestion(firstQuestion);

      speak(start.data.question);
    } catch (err) {
      console.log(err);
      alert("Failed to start resume interview");
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
            ...headers,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      // interview finished
      if (res.data.interview_completed) {
        speak("Interview completed. Great job!");
        setSession(null);
        setQuestion(null);
        return;
      }

      // next question
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
            Resume Based AI Interview
          </h1>
          <p className="text-gray-400 mt-2">
            AI automatically builds your interview from your resume
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex justify-center text-gray-300 gap-2">
            <Loader2 className="animate-spin" />
            Preparing your interview...
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
