import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mic } from "lucide-react";
import { login } from "../services/authService";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [popup, setPopup] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const [formData, setFormData] = useState({
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
      const res = await login({
        email: formData.email,
        password: formData.password,
      });

      // store JWT token
      localStorage.setItem("token", res.data.access_token);

      setPopup({
        type: "success",
        message: "Login successful!",
      });

      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);

    } catch (error: any) {
      setPopup({
        type: "error",
        message:
          error?.response?.data?.detail ||
          "Invalid credentials. Please try again.",
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

      {/* ================= HERO ================= */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-20 text-white py-10">

        <div className="flex items-center gap-3 mb-8">
          <div className="bg-gradient-to-r from-violet-500 to-cyan-500 p-3 rounded-2xl shadow-lg hover:scale-105 transition">
            <Mic size={28} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Voice AI Interviewer
          </h1>
        </div>

        <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight">
          Welcome back 👋
          <br />
          Continue your journey
        </h2>

        <p className="text-gray-300 text-base sm:text-lg mt-6 max-w-lg">
          Login to continue practicing AI-powered interviews, get feedback,
          and improve your communication skills.
        </p>

        <div className="mt-8 text-cyan-400 text-sm animate-pulse">
          Improve daily. Get hired faster.
        </div>
      </div>

      {/* ================= FORM ================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10">

        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Login
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Welcome back, please enter your details
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

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
                className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-300
                           focus:ring-2 focus:ring-cyan-500 outline-none transition"
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
                  className="mt-2 w-full px-4 py-3 pr-12 rounded-xl border border-gray-300
                             focus:ring-2 focus:ring-cyan-500 outline-none transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-6 text-gray-500"
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
                         hover:from-violet-700 hover:to-cyan-600 transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6 text-sm">
            Don’t have an account?
            <button
              onClick={() => navigate("/signup")}
              className="ml-2 text-cyan-600 font-semibold hover:underline"
            >
              Sign up
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

export default Login;