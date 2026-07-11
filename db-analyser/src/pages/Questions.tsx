import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, Tooltip, CartesianGrid } from "recharts";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/services/api";

type ChartConfig = {
  type: "bar" | "line" | "pie";
  x: string;
  y: string;
};

type QuestionItem = {
  title: string;
  description: string;
  sql: string;
  chart: ChartConfig;
};

type CategoriesResponse = {
  dataset_id: string;
  categories: Array<{ name: string; columns: string[] }>;
};

type QuestionsResponse = {
  dataset_id: string;
  category: string;
  source: string;
  question_count: number;
  questions: QuestionItem[];
};

type ExecutedResult = {
  loading: boolean;
  error?: string;
  data?: {
    summary: string;
    rows: Array<Record<string, unknown>>;
    executed_query: string;
    chart: ChartConfig;
  };
};

type SessionQuestionItem = {
  title: string;
  description: string;
  sql: string;
  summary: string;
  rows: Array<Record<string, unknown>>;
  chart: ChartConfig;
};

const COLORS = ["#22D3EE", "#7C3AED", "#A855F7", "#F472B6", "#FBBF24"];

const SESSION_STORAGE_KEY = (datasetId: string) => `report_session_results_${datasetId}`;

function saveSessionQuestionResult(
  datasetId: string,
  question: QuestionItem,
  data: NonNullable<ExecutedResult["data"]>
) {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY(datasetId));
    const sessionItems: SessionQuestionItem[] = raw ? JSON.parse(raw) : [];
    const updatedItems = sessionItems.filter((item) => item.title !== question.title);

    updatedItems.push({
      title: question.title,
      description: question.description,
      sql: question.sql,
      summary: data.summary,
      rows: data.rows,
      chart: data.chart,
    });

    localStorage.setItem(SESSION_STORAGE_KEY(datasetId), JSON.stringify(updatedItems));
  } catch {
    // ignore session persistence failures
  }
}

export default function Questions() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoriesResponse | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [asking, setAsking] = useState(false);
  const [expandedSql, setExpandedSql] = useState<Record<number, boolean>>({});
  const [expandedChart, setExpandedChart] = useState<Record<number, boolean>>({});
  const [executedResults, setExecutedResults] = useState<Record<number, ExecutedResult>>({});

  useEffect(() => {
    const datasetId = localStorage.getItem("dataset_id");

    if (!datasetId) {
      toast.error("Please upload a dataset first.");
      navigate("/");
      return;
    }

    async function loadCategories() {
      try {
        const response = await api.get<CategoriesResponse>(`/datasets/${datasetId}/categories`);
        setCategories(response.data);
        const firstCategory = response.data.categories[0]?.name || "";
        setActiveCategory(firstCategory);

        if (firstCategory) {
          requestQuestions(firstCategory);
        }
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { detail?: string } }; message: string };
        const detail = axiosError.response?.data?.detail || axiosError.response?.data || axiosError.message;
        toast.error(`Unable to load categories: ${detail}`);
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, [navigate]);

  async function requestQuestions(category: string) {
    const datasetId = localStorage.getItem("dataset_id");

    if (!datasetId) {
      toast.error("Please upload a dataset first.");
      navigate("/");
      return;
    }

    setAsking(true);

    try {
      const response = await api.post<QuestionsResponse>(`/datasets/${datasetId}/questions`, {
        category,
        use_ai: true,
      });
      setQuestions(response.data.questions);

      if (!response.data.questions.length) {
        toast.error("No questions could be generated for this category. Try another category.");
      }
      setActiveCategory(category);
      setExpandedSql({});
      setExecutedResults({});
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { detail?: string | Array<{ msg?: string }> } };
        message: string;
      };
      const responseDetail = axiosError.response?.data?.detail;
      const detail =
        typeof responseDetail === "string"
          ? responseDetail
          : Array.isArray(responseDetail)
            ? responseDetail.map((item) => item.msg).filter(Boolean).join(", ")
            : axiosError.message;
      toast.error(`Unable to generate questions: ${detail}`);
    } finally {
      setAsking(false);
    }
  }

  async function runQuestion(index: number, question: QuestionItem) {
    const datasetId = localStorage.getItem("dataset_id");

    if (!datasetId) {
      toast.error("Please upload a dataset first.");
      navigate("/");
      return;
    }

    setExecutedResults((prev) => ({
      ...prev,
      [index]: {
        loading: true,
      },
    }));

    try {
      const response = await api.post(`/datasets/${datasetId}/execute-question`, {
        title: question.title,
        description: question.description,
        sql: question.sql,
        chart: question.chart,
      });

      setExecutedResults((prev) => ({
        ...prev,
        [index]: {
          loading: false,
          data: response.data,
        },
      }));

      saveSessionQuestionResult(datasetId, question, response.data);
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { detail?: string | Array<{ msg?: string }> } };
        message: string;
      };
      const responseDetail = axiosError.response?.data?.detail;
      const detail =
        typeof responseDetail === "string"
          ? responseDetail
          : Array.isArray(responseDetail)
            ? responseDetail.map((item) => item.msg).filter(Boolean).join(", ")
            : axiosError.message;

      setExecutedResults((prev) => ({
        ...prev,
        [index]: {
          loading: false,
          error: `Failed to execute query: ${detail}`,
        },
      }));
    }
  }

  function renderChartPreview(rows: Array<Record<string, unknown>>, chart: ChartConfig) {
    if (!rows.length) {
      return <p className="text-gray-400">No chart rows available.</p>;
    }

    const data = rows.map((row) => ({
      ...row,
      value: Number(row[chart.y]) ?? 0,
    }));

    if (chart.type === "line") {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#2e2e43" vertical={false} />
            <XAxis dataKey={chart.x} stroke="#9CA3AF" />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#22D3EE" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chart.type === "pie") {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey={chart.x} outerRadius={90} fill="#22D3EE">
              {data.map((entry, index) => (
                <Cell key={entry[chart.x] as string | number | undefined} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#2e2e43" vertical={false} />
          <XAxis dataKey={chart.x} stroke="#9CA3AF" />
          <Tooltip />
          <Bar dataKey="value" fill="#22D3EE" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">Questions</h1>
        <p className="mt-2 text-gray-400 max-w-2xl">
          Explore smart questions generated from your uploaded dataset and choose a category to discover the most relevant insights.
        </p>
      </div>

      {loading ? (
        <div className="text-white">Loading categories...</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          <aside className="rounded-3xl border border-violet-800/30 bg-[#111118] p-6">
            <h2 className="text-xl font-semibold text-white">Categories</h2>
            <div className="mt-6 space-y-3">
              {categories?.categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() => requestQuestions(category.name)}
                  disabled={asking}
                  className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                    category.name === activeCategory
                      ? "border-cyan-400 bg-cyan-500/10 text-cyan-200"
                      : "border-violet-800/40 bg-[#0E0D14] text-gray-200 hover:border-cyan-400/60"
                  }`}
                >
                  <div className="font-semibold">{category.name}</div>
                  <p className="mt-2 text-sm text-gray-400">
                    {category.columns.slice(0, 4).join(", ")}
                    {category.columns.length > 4 ? "..." : ""}
                  </p>
                </button>
              ))}
            </div>
          </aside>

          <section className="space-y-6">
            <div className="rounded-3xl border border-violet-800/30 bg-[#111118] p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Selected Category</h2>
                  <p className="mt-2 text-gray-400">{activeCategory || "Choose a category to load questions"}</p>
                </div>
                <button
                  onClick={() => requestQuestions(activeCategory)}
                  disabled={!activeCategory || asking}
                  className="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-cyan-500 to-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {asking ? "Generating..." : "Generate Questions"}
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-violet-800/30 bg-[#111118] p-8">
              <h2 className="text-2xl font-bold text-white">Questions</h2>

              {asking && questions.length === 0 ? (
                <div className="mt-6 space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-28 animate-pulse rounded-3xl border border-violet-800/20 bg-[#0E0D14]"
                    />
                  ))}
                </div>
              ) : questions.length === 0 ? (
                <p className="mt-4 text-gray-400">No questions generated yet. Select a category and press the button above.</p>
              ) : (
                <div className="mt-6 space-y-4">
                  {questions.map((question, index) => {
                    const result = executedResults[index];
                    const isSqlVisible = expandedSql[index] ?? false;

                    return (
                      <motion.div
                        key={`${question.title}-${index}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-3xl border border-violet-800/20 bg-[#0E0D14] p-6"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-lg font-semibold text-white">{question.title}</p>
                            <p className="mt-3 text-gray-300">{question.description}</p>
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedSql((prev) => ({
                                  ...prev,
                                  [index]: !prev[index],
                                }))
                              }
                              className="w-full sm:w-[160px] rounded-2xl border border-violet-800/40 bg-[#111118] px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:border-cyan-400/60 hover:bg-[#171620]"
                            >
                              {isSqlVisible ? "Hide SQL" : "View SQL"}
                            </button>

                            <button
                              type="button"
                              onClick={() => runQuestion(index, question)}
                              disabled={result?.loading}
                              className="w-full sm:w-[160px] rounded-2xl border border-cyan-400 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {result?.loading ? "Running..." : "Run Question"}
                            </button>

                            {result?.data ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedChart((prev) => ({
                                    ...prev,
                                    [index]: !prev[index],
                                  }))
                                }
                                className="w-full sm:w-[160px] rounded-2xl border border-violet-800/40 bg-[#111118] px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:border-cyan-400/60 hover:bg-[#171620]"
                              >
                                {expandedChart[index] ? "Hide Chart" : "View Chart"}
                              </button>
                            ) : null}
                          </div>
                        </div>

                        {isSqlVisible && (
                          <pre className="mt-4 overflow-x-auto rounded-3xl border border-violet-800/30 bg-[#12111C] p-4 text-sm text-green-200">
                            {question.sql.trim()}
                          </pre>
                        )}

                        {result?.error ? (
                          <div className="mt-4 rounded-3xl border border-rose-500/20 bg-[#1f131f] p-4 text-sm text-rose-200">
                            {result.error}
                          </div>
                        ) : null}

                        {result?.data ? (
                          <div className="mt-4 space-y-4">
                            <div className="rounded-3xl border border-violet-800/30 bg-[#111118] p-4">
                              <p className="font-semibold text-white">Execution summary</p>
                              <p className="mt-2 text-gray-300">{result.data.summary}</p>
                            </div>

                            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
                              <div className="rounded-3xl border border-violet-800/30 bg-[#111118] p-4">
                                <div className="mb-3 flex items-center justify-between gap-4">
                                  <p className="font-semibold text-white">Query results</p>
                                  <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-200">
                                    {result.data.rows.length} rows
                                  </span>
                                </div>
                                <div className="overflow-x-auto text-sm">
                                  <table className="min-w-full border-separate border-spacing-0 text-left text-gray-200">
                                    <thead>
                                      <tr>
                                        {Object.keys(result.data.rows[0] ?? {}).map((column) => (
                                          <th key={column} className="border-b border-violet-800/30 px-2 py-2 text-xs uppercase tracking-[0.12em] text-gray-400">
                                            {column}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {result.data.rows.slice(0, 4).map((row, rowIndex) => (
                                        <tr key={rowIndex} className="border-b border-violet-800/20 last:border-b-0">
                                          {Object.keys(result.data.rows[0]).map((column) => (
                                            <td key={`${rowIndex}-${column}`} className="px-2 py-3 align-top text-sm text-gray-200">
                                              {String(row[column] ?? "-")}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              <div className="rounded-3xl border border-violet-800/30 bg-[#111118] p-4">
                                <div className="flex items-center justify-between gap-4">
                                  <p className="font-semibold text-white">Chart preview</p>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedChart((prev) => ({
                                        ...prev,
                                        [index]: !prev[index],
                                      }))
                                    }
                                    className="rounded-2xl border border-violet-800/40 bg-[#111118] px-3 py-1 text-xs font-semibold text-cyan-300 transition hover:border-cyan-400/60 hover:bg-[#171620]"
                                  >
                                    {expandedChart[index] ? "Hide chart" : "Show chart"}
                                  </button>
                                </div>
                                {expandedChart[index] ? (
                                  <div className="mt-4 h-56">{renderChartPreview(result.data.rows, result.data.chart)}</div>
                                ) : (
                                  <p className="mt-4 text-sm text-gray-400">Click “Show chart” to render chart output.</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
