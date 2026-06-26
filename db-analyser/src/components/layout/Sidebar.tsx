import {
  BrainCircuit,
  ChartColumn,
  Database,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

const menu = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    title: "Upload",
    icon: Database,
    path: "/",
  },
  {
    title: "AI Questions",
    icon: BrainCircuit,
    path: "/questions",
  },
  {
    title: "Charts",
    icon: ChartColumn,
    path: "/charts",
  },
  {
    title: "Validation",
    icon: ShieldCheck,
    path: "/validation",
  },
  {
    title: "Reports",
    icon: FileText,
    path: "/reports",
  },
];

export default function Sidebar() {
  return (
    <aside
      className="
      w-72
      h-screen
      border-r
      border-violet-900/40
      bg-gradient-to-b
      from-[#12111C]
      via-[#0C0B12]
      to-[#09090B]
      flex
      flex-col
      justify-between
      shadow-2xl
    "
    >
      {/* Logo */}

      <div>
        <div className="px-8 pt-8 pb-10">

          <motion.div
            whileHover={{ rotate: 8, scale: 1.08 }}
            transition={{ duration: 0.25 }}
            className="
            w-16
            h-16
            rounded-2xl
            bg-gradient-to-br
            from-cyan-400
            via-violet-500
            to-indigo-600
            flex
            items-center
            justify-center
            shadow-[0_0_35px_rgba(34,211,238,0.35)]
            "
          >
            <Sparkles className="text-white" size={30} />
          </motion.div>

          <h1 className="mt-6 text-3xl font-extrabold text-white tracking-tight">
            Smart
          </h1>

          <p className="text-cyan-400 text-lg font-medium">
            Data Analyzer
          </p>

          <p className="text-xs text-gray-500 mt-2">
            AI Powered Analytics Platform
          </p>

        </div>

        {/* Navigation */}

        <nav className="px-5 space-y-3">

          {menu.map((item) => {

            const Icon = item.icon;

            return (
              <NavLink
                key={item.title}
                to={item.path}
              >
                {({ isActive }) => (

                  <motion.div
                    whileHover={{
                      scale: 1.03,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    className={`
                    relative
                    flex
                    items-center
                    gap-4
                    rounded-2xl
                    px-5
                    py-4
                    transition-all
                    duration-300
                    cursor-pointer

                    ${
                      isActive
                        ? "bg-violet-600/20 text-cyan-400 shadow-lg"
                        : "text-gray-400 hover:bg-violet-500/10 hover:text-white"
                    }
                    `}
                  >

                    {/* Active Indicator */}

                    {isActive && (

                      <motion.div
                        layoutId="sidebar-active"
                        className="
                        absolute
                        left-0
                        top-3
                        bottom-3
                        w-1
                        rounded-full
                        bg-cyan-400
                        shadow-[0_0_12px_#22d3ee]
                        "
                      />

                    )}

                    <Icon size={22} />

                    <span className="font-medium tracking-wide">
                      {item.title}
                    </span>

                  </motion.div>

                )}
              </NavLink>
            );

          })}

        </nav>
      </div>

      {/* Bottom */}

      <motion.div
        whileHover={{ scale: 1.02 }}
        className="mt-auto rounded-3xl border border-violet-800/30 bg-[#111118] p-3 shadow-[0_0_18px_rgba(124,58,237,.12)]"
      >
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-400">
          System Status
        </h3>

        <StatusItem title="Backend" status="Online" color="bg-emerald-400" />
        <StatusItem title="AI Engine" status="Ready" color="bg-cyan-400" />
        <StatusItem title="Database" status="Connected" color="bg-violet-400" />
        <StatusItem title="Processing" status="Fast" color="bg-yellow-400" />
      </motion.div>

    </aside>
  );
}
type StatusItemProps = {
  title: string;
  status: string;
  color: string;
};

function StatusItem({ title, status, color }: StatusItemProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <span className="text-gray-300">{title}</span>

      <div className="flex items-center gap-2">
        <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <span className="text-sm font-medium text-white">{status}</span>
      </div>
    </div>
  );
}