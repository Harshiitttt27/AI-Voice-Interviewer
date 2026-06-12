import {
  Mic,
  LogOut,
  User,
  LayoutDashboard,
  Brain,
  MessageSquareText,
  Menu,
  X,
} from "lucide-react";

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Interview", path: "/interviews", icon: Brain },
    { name: "Feedback", path: "/history", icon: MessageSquareText },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#07070c]/70 backdrop-blur-2xl border-b border-white/10">

      <div className="h-16 flex items-center justify-between px-4 md:px-6">

        {/* ================= BRAND ================= */}
        <div
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 shadow-lg">
            <Mic size={18} className="text-white" />
          </div>

          <div className="leading-tight">
            <h1 className="text-sm font-semibold text-white">
              Voice AI Interviewer
            </h1>
            <p className="text-[11px] text-gray-400">
              AI Interview Platform
            </p>
          </div>
        </div>

        {/* ================= DESKTOP NAV ================= */}
        <nav className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1">

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-200
                  ${
                    isActive(item.path)
                      ? "bg-white text-black shadow-md"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <Icon size={15} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* ================= RIGHT SECTION ================= */}
        <div className="flex items-center gap-3">

          {/* USER */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 flex items-center justify-center">
              <User size={14} className="text-white" />
            </div>

            <div className="leading-tight">
              <p className="text-xs text-white">User</p>
              <p className="text-[10px] text-gray-400">Online</p>
            </div>
          </div>

          {/* LOGOUT */}
          <button
            onClick={logout}
            className="hidden md:flex px-4 py-2 rounded-xl text-sm text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition"
          >
            <LogOut size={16} className="mr-1" />
            Logout
          </button>

          {/* ================= MOBILE MENU BUTTON ================= */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10"
          >
            {mobileOpen ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}
          </button>
        </div>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 border-t border-white/10 bg-black/40 backdrop-blur-xl">

          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition
                  ${
                    isActive(item.path)
                      ? "bg-white text-black"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <Icon size={16} />
                {item.name}
              </button>
            );
          })}

          {/* mobile logout */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm text-red-400 bg-red-500/10 border border-red-500/20"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </header>
  );
}