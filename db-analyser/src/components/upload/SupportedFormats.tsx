import { Database, FileSpreadsheet, FileText, Table } from "lucide-react";
import { motion } from "framer-motion";

const formats = [
  {
    name: "CSV",
    icon: FileText,
    color: "text-cyan-400",
    description: "Comma Separated Values",
  },
  {
    name: "Excel",
    icon: FileSpreadsheet,
    color: "text-emerald-400",
    description: ".xls / .xlsx",
  },
  {
    name: "SQLite",
    icon: Database,
    color: "text-violet-400",
    description: ".db / .sqlite",
  },
  {
    name: "SQL",
    icon: Table,
    color: "text-orange-400",
    description: ".sql scripts",
  },
];

export default function SupportedFormats() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-16 rounded-3xl border border-violet-800/30 bg-[#111118] p-8 shadow-[0_0_35px_rgba(124,58,237,0.12)]"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">
          Supported Database Formats
        </h2>

        <p className="mt-2 text-gray-400">
          Upload any of the following file types to begin AI-powered analysis.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {formats.map((format) => {
          const Icon = format.icon;

          return (
            <motion.div
              key={format.name}
              whileHover={{
                y: -6,
                scale: 1.03,
              }}
              className="rounded-2xl border border-violet-700/20 bg-[#181821] p-6 transition hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(34,211,238,0.12)]"
            >
              <Icon className={`mb-5 h-10 w-10 ${format.color}`} />

              <h3 className="text-lg font-semibold text-white">
                {format.name}
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                {format.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}