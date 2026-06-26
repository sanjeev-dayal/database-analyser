import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit } from "lucide-react";
import api from "@/services/api";

type QuestionItem = {
  title: string;
  description: string;
  sql: string;
  chart: {
    type: string;
    x: string;
    y: string;
  };
};

type RecentQuestionsProps = {
  categories: Array<{ name: string; columns: string[] }>;
};

export default function RecentQuestions({ categories }: RecentQuestionsProps) {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.name || "");

  useEffect(() => {
    async function loadQuestions() {
      if (!categories.length) {
        setQuestions([]);
        setLoading(false);
        return;
      }

      const datasetId = localStorage.getItem("dataset_id");
      if (!datasetId) {
        setQuestions([]);
        setLoading(false);
        return;
      }

      const category = categories[0].name;
      setActiveCategory(category);

      try {
        const response = await api.post(`/datasets/${datasetId}/questions`, {
          category,
          use_ai: false,
        });
        setQuestions(response.data.questions || []);
      } catch {
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [categories]);

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
          <h2 className="text-3xl font-bold">AI Generated Questions</h2>
          <p className="text-gray-400">
            Business insights suggested by AI for {activeCategory || "your dataset"}.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-violet-800/30 bg-[#191923] p-6 text-gray-400">
          Loading question preview...
        </div>
      ) : questions.length === 0 ? (
        <div className="rounded-3xl border border-violet-800/30 bg-[#191923] p-6 text-gray-400">
          No questions available yet. Upload a dataset and visit the AI Questions page to generate more.
        </div>
      ) : (
        <div className="space-y-5">
          {questions.slice(0, 4).map((question, index) => (
            <motion.div
              key={`${question.title}-${index}`}
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
                  Preview
                </div>
              </div>

              <h3 className="text-xl font-semibold text-white">{question.title}</h3>
              <p className="mt-3 text-gray-300">{question.description}</p>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
