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
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 12000 },
  { month: "Feb", revenue: 18000 },
  { month: "Mar", revenue: 15000 },
  { month: "Apr", revenue: 24000 },
  { month: "May", revenue: 21000 },
  { month: "Jun", revenue: 29000 },
];

const categoryData = [
  { name: "Electronics", value: 38 },
  { name: "Furniture", value: 27 },
  { name: "Clothing", value: 20 },
  { name: "Others", value: 15 },
];

const COLORS = [
  "#22D3EE",
  "#7C3AED",
  "#38BDF8",
  "#6366F1",
];

export default function ChartPreview() {
  return (
    <div className="space-y-6">

      {/* Revenue */}

      <motion.div
        whileHover={{ y: -4 }}
        className="rounded-3xl border border-violet-800/30 bg-[#111118] p-6"
      >
        <h2 className="mb-6 text-xl font-bold text-white">
          Revenue Overview
        </h2>

        <div className="h-72">

          <ResponsiveContainer width="100%" height="100%">

            <BarChart data={revenueData}>

              <XAxis
                dataKey="month"
                stroke="#9CA3AF"
              />

              <Tooltip />

              <Bar
                dataKey="revenue"
                fill="#22D3EE"
                radius={[8, 8, 0, 0]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

      </motion.div>

      {/* Bottom */}

      <div className="grid gap-6 lg:grid-cols-2">

        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-3xl border border-violet-800/30 bg-[#111118] p-6"
        >
          <h2 className="mb-5 text-xl font-bold text-white">
            Sales Trend
          </h2>

          <div className="h-64">

            <ResponsiveContainer width="100%" height="100%">

              <LineChart data={revenueData}>

                <XAxis
                  dataKey="month"
                  stroke="#9CA3AF"
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#7C3AED"
                  strokeWidth={3}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-3xl border border-violet-800/30 bg-[#111118] p-6"
        >
          <h2 className="mb-5 text-xl font-bold text-white">
            Category Distribution
          </h2>

          <div className="h-64">

            <ResponsiveContainer width="100%" height="100%">

              <PieChart>

                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                >
                  {categoryData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                    />
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