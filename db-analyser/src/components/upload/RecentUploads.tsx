import { motion } from "framer-motion";
import { Database, CheckCircle2, Clock3 } from "lucide-react";

const uploads = [
  {
    id: 1,
    name: "sales_2025.csv",
    size: "2.1 MB",
    time: "2 minutes ago",
    status: "Completed",
  },
  {
    id: 2,
    name: "customers.sqlite",
    size: "4.8 MB",
    time: "Yesterday",
    status: "Completed",
  },
  {
    id: 3,
    name: "inventory.xlsx",
    size: "1.7 MB",
    time: "3 days ago",
    status: "Completed",
  },
];

export default function RecentUploads() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-10 rounded-3xl border border-violet-800/30 bg-[#111118] p-8 shadow-[0_0_35px_rgba(124,58,237,0.12)]"
    >
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Recent Uploads
          </h2>

          <p className="mt-2 text-gray-400">
            Recently uploaded databases.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {uploads.map((upload) => (
          <motion.div
            key={upload.id}
            whileHover={{
              scale: 1.01,
              x: 6,
            }}
            className="flex items-center justify-between rounded-2xl border border-violet-700/20 bg-[#181821] p-5 transition hover:border-cyan-500/40"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-cyan-500/10 p-3">
                <Database className="h-6 w-6 text-cyan-400" />
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  {upload.name}
                </h3>

                <p className="text-sm text-gray-400">
                  {upload.size}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-gray-400">
                <Clock3 className="h-4 w-4" />
                <span>{upload.time}</span>
              </div>

              <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">
                  {upload.status}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}