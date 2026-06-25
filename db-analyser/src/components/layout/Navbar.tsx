import {
  Bell,
  Search,
  Moon,
  Settings,
  ChevronDown,
} from "lucide-react";

import { useLocation } from "react-router-dom";

const titles: Record<string, string> = {
  "/": "Upload Dataset",
  "/dashboard": "Dashboard",
  "/questions": "AI Questions",
  "/charts": "Charts",
  "/validation": "Data Validation",
  "/settings": "Settings",
};

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="h-20 border-b border-violet-900/40 bg-[#12111C]/70 backdrop-blur-xl flex items-center justify-between px-8">

      {/* Left */}

      <div>

        <h1 className="text-2xl font-bold text-white">
          {titles[location.pathname]}
        </h1>

        <p className="text-gray-400 text-sm mt-1">
          AI Powered Database Analysis
        </p>

      </div>

      {/* Right */}

      <div className="flex items-center gap-5">

        {/* Search */}

        <div className="relative">

          <Search
            className="absolute left-4 top-3 text-cyan-400"
            size={18}
          />

          <input
            placeholder="Search..."
            className="
            w-72
            pl-11
            pr-4
            py-3
            rounded-xl
            bg-[#0F0E17]
            border
            border-violet-900/40
            outline-none
            text-white
            focus:border-cyan-400
            "
          />

        </div>

        {/* Notification */}

        <button className="relative p-3 rounded-xl bg-[#171620] hover:bg-violet-900/20 transition">

          <Bell className="text-white"/>

          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-cyan-400"/>

        </button>

        {/* Theme */}

        <button className="p-3 rounded-xl bg-[#171620] hover:bg-violet-900/20">

          <Moon className="text-white"/>

        </button>

        {/* Settings */}

        <button className="p-3 rounded-xl bg-[#171620] hover:bg-violet-900/20">

          <Settings className="text-white"/>

        </button>

        {/* Profile */}

        <button className="flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-2 rounded-xl">

          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white">

            S

          </div>

          <ChevronDown className="text-white"/>

        </button>

      </div>

    </header>
  );
}