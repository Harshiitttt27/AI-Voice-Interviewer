import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mic, Sparkles } from "lucide-react";
import { signup } from "../services/authService";

function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [popup, setPopup] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signup({
        name: formData.username,
        email: formData.email,
        password: formData.password,
      });

      setPopup({
        type: "success",
        message: res?.message || "Account created successfully",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1200);

    } catch (error: any) {
      setPopup({
        type: "error",
        message:
          error?.response?.data?.detail ||
          "Signup failed. Please try again.",
      });

    } finally {
      setLoading(false);

      setTimeout(() => {
        setPopup({ type: null, message: "" });
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gradient-to-br from-black via-violet-950 to-cyan-950">

      {/* ================= LEFT / HERO ================= */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-20 text-white">

        <div className="flex items-center gap-3 mb-8 mt-8 lg:mt-0">
          <div className="bg-gradient-to-r from-violet-500 to-cyan-500 p-3 rounded-2xl shadow-lg hover:scale-105 transition">
            <Mic size={28} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Voice AI Interviewer
          </h1>
        </div>

        <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight">
          Practice interviews
          <br />
          with AI voice
        </h2>

        <p className="text-gray-300 text-base sm:text-lg mt-5 max-w-lg leading-relaxed">
          Improve communication skills with realistic AI-powered interviews,
          instant feedback, and personalized recommendations.
        </p>

        <div className="grid grid-cols-2 gap-4 mt-8">

          <div className="bg-white/10 backdrop-blur-md px-4 py-4 rounded-2xl border border-white/10 hover:scale-105 transition">
            <Sparkles className="text-cyan-400 mb-2" />
            <p className="text-sm">AI Feedback</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-4 rounded-2xl border border-white/10 hover:scale-105 transition">
            <Mic className="text-violet-400 mb-2" />
            <p className="text-sm">Voice Interview</p>
          </div>

        </div>

        <div className="lg:hidden mt-10 text-center">
          <p className="text-gray-400 text-sm mb-2">
            Start your journey now
          </p>
          <div className="text-cyan-400 animate-pulse text-sm">
            ↓ Create your account below ↓
          </div>
        </div>
      </div>

      {/* ================= FORM ================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10">

        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Create Account
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Join the AI interview revolution
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Username */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300
                           focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
                           outline-none transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300
                           focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
                           outline-none transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create password"
                  className="mt-2 w-full px-4 py-3 pr-12 rounded-xl border border-gray-300
                             focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
                             outline-none transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-6 text-gray-500 hover:text-cyan-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-cyan-500
                         text-white py-3 rounded-xl font-semibold
                         hover:from-violet-700 hover:to-cyan-600
                         transition active:scale-95"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6 text-sm">
            Already have an account?
            <button
              onClick={() => navigate("/login")}
              className="ml-2 text-cyan-600 font-semibold hover:underline"
            >
              Login
            </button>
          </p>

        </div>
      </div>

      {/* ================= POPUP ================= */}
      {popup.type && (
        <div className="fixed top-6 right-6 z-50">
          <div
            className={`px-5 py-3 rounded-xl text-white shadow-lg text-sm font-medium
            ${popup.type === "success" ? "bg-green-500" : "bg-red-500"}`}
          >
            {popup.message}
          </div>
        </div>
      )}
    </div>
  );
}

export default Signup;