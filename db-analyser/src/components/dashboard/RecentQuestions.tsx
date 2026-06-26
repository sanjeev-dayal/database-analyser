import { motion } from "framer-motion";
import {
  BrainCircuit,
  ChartColumn,
  Database,
  Sparkles,
} from "lucide-react";

const questions = [
  "Which products generated the highest revenue?",
  "Which customer segment purchases the most?",
  "Which city has maximum sales?",
  "Which month recorded the highest profit?",
];

export default function RecentQuestions() {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-3xl border border-violet-800/30 bg-[#111118] p-8 shadow-[0_0_35px_rgba(124,58,237,.15)]"
    >
      <div className="mb-8 flex items-center gap-4">

        <div className="rounded-2xl bg-cyan-500/10 p-4">
          <BrainCircuit className="text-cyan-400" />
        </div>

        <div>

          <h2 className="text-3xl font-bold">
            AI Generated Questions
          </h2>

          <p className="text-gray-400">
            Business insights suggested by AI
          </p>

        </div>

      </div>

      <div className="space-y-5">

        {questions.map((question, index) => (
          <motion.div
            key={question}
            whileHover={{
              scale: 1.02,
            }}
            className="rounded-2xl border border-violet-800/20 bg-[#191923] p-6"
          >
            <div className="mb-3 flex items-center justify-between">

              <div className="rounded-full bg-cyan-500/15 px-3 py-1 text-sm text-cyan-400">
                AI Insight #{index + 1}
              </div>

              <div className="rounded-full bg-violet-500/10 px-3 py-1 text-sm text-violet-300">
                Ready
              </div>

            </div>

            <h3 className="text-xl font-semibold">
              {question}
            </h3>

            <p className="mt-2 text-gray-400">
              Generated automatically after analyzing the uploaded dataset.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">

              <button className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 transition hover:bg-violet-500">
                <Database size={18} />
                View SQL
              </button>

              <button className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 transition hover:bg-cyan-500">
                <ChartColumn size={18} />
                Generate Chart
              </button>

              <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-2 transition hover:opacity-90">
                <Sparkles size={18} />
                Ask AI
              </button>

            </div>
          </motion.div>
        ))}

      </div>
    </motion.div>
  );
}