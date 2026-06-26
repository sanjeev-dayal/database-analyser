import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const lines = [
  "Dataset uploaded successfully.",
  "54,820 rows detected.",
  "16 columns identified.",
  "Missing values found in 2 columns.",
  "Revenue trend detected.",
  "AI confidence score: 96%.",
];

export default function AISummary() {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (visible < lines.length) {
      const timer = setTimeout(() => {
        setVisible((v) => v + 1);
      }, 700);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-3xl border border-violet-800/30 bg-[#111118] p-8 shadow-[0_0_35px_rgba(124,58,237,.15)]"
    >
      <div className="mb-8 flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="rounded-2xl bg-cyan-500/10 p-4">
            <Sparkles className="text-cyan-400" size={28} />
          </div>

          <div>

            <h2 className="text-3xl font-bold">
              AI Assistant
            </h2>

            <p className="text-gray-400">
              GPT-4 Powered Dataset Analysis
            </p>

          </div>

        </div>

        <div className="rounded-full bg-cyan-500/10 px-4 py-2 text-sm text-cyan-400">
          Live Analysis
        </div>

      </div>

      <div className="rounded-2xl bg-[#1A1A25] p-6">

        {lines.slice(0, visible).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-5 flex items-center gap-3 text-lg"
          >
            <span className="text-green-400">✔</span>
            {line}
          </motion.div>
        ))}

        {visible < lines.length && (
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
            className="mt-3 text-2xl text-cyan-400"
          >
            ▌
          </motion.div>
        )}

      </div>
    </motion.div>
  );
}