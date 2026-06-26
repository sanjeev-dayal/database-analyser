import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

type ChartPreviewProps = {
  schema: {
    numeric_columns: string[];
    categorical_columns: string[];
    date_columns: string[];
  };
  categories: Array<{ name: string; columns: string[] }>;
};

const COLORS = ["#22D3EE", "#7C3AED", "#A855F7", "#F472B6", "#FBBF24"];

export default function ChartPreview({ schema, categories }: ChartPreviewProps) {
  const barData = useMemo(
    () =>
      categories.map((category) => ({
        name: category.name,
        columns: category.columns.length,
      })),
    [categories]
  );

  const lineData = useMemo(
    () =>
      categories.map((category) => ({
        name: category.name,
        value: category.columns.length,
      })),
    [categories]
  );

  const pieData = useMemo(
    () => [
      { name: "Numeric", value: schema.numeric_columns.length },
      { name: "Categorical", value: schema.categorical_columns.length },
      { name: "Date", value: schema.date_columns.length },
    ],
    [schema]
  );

  return (
    <div className="space-y-6">
      <motion.div
        whileHover={{ y: -4 }}
        className="rounded-3xl border border-violet-800/30 bg-[#111118] p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Category Overview</h2>
            <p className="text-sm text-gray-400">Visualize how dataset categories are distributed.</p>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid stroke="#2E2E3E" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <Tooltip />
              <Bar dataKey="columns" fill="#22D3EE" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-3xl border border-violet-800/30 bg-[#111118] p-6"
        >
          <h2 className="mb-5 text-xl font-bold text-white">Category Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid stroke="#2E2E3E" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={3} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-3xl border border-violet-800/30 bg-[#111118] p-6"
        >
          <h2 className="mb-5 text-xl font-bold text-white">Schema Breakdown</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80}>
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
