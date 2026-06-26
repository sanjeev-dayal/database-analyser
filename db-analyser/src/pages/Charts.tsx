import { useEffect, useMemo, useState } from "react";
import { type AxiosError } from "axios";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/services/api";

type CategoriesResponse = {
  dataset_id: string;
  categories: Array<{ name: string; columns: string[] }>;
};

type DashboardResponse = {
  dataset_id: string;
  schema: {
    row_count: number;
    column_count: number;
    numeric_columns: string[];
    categorical_columns: string[];
    date_columns: string[];
  };
  profile: {
    overview: {
      row_count: number;
      column_count: number;
      duplicate_rows: number;
      total_missing_values: number;
    };
  };
};

const COLORS = ["#22D3EE", "#7C3AED", "#A855F7", "#F472B6", "#FBBF24"];

export default function Charts() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoriesResponse | null>(null);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const datasetId = localStorage.getItem("dataset_id");

    if (!datasetId) {
      toast.error("Please upload a dataset first.");
      navigate("/");
      return;
    }

    async function loadData() {
      try {
        const [categoriesResponse, dashboardResponse] = await Promise.all([
          api.get<CategoriesResponse>(`/datasets/${datasetId}/categories`),
          api.get<DashboardResponse>(`/datasets/${datasetId}/dashboard`),
        ]);

        setCategories(categoriesResponse.data);
        setDashboard(dashboardResponse.data);
      } catch (error: unknown) {
        const axiosError = error as AxiosError<{ detail?: string }>;
        const detail = axiosError.response?.data?.detail || axiosError.response?.data || axiosError.message;
        toast.error(`Unable to load chart data: ${detail}`);
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [navigate]);

  const barData = useMemo(() => {
    return categories?.categories.map((category) => ({
      category: category.name,
      columns: category.columns.length,
    })) || [];
  }, [categories]);

  const pieData = useMemo(() => {
    if (!dashboard) return [];
    return [
      { name: "Numeric", value: dashboard.schema.numeric_columns.length },
      { name: "Categorical", value: dashboard.schema.categorical_columns.length },
      { name: "Dates", value: dashboard.schema.date_columns.length },
    ];
  }, [dashboard]);

  if (loading) {
    return <div className="text-white">Loading chart data...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">Charts</h1>
        <p className="mt-2 text-gray-400 max-w-2xl">
          Visualize dataset structure and insight categories generated from your uploaded data.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-3xl border border-violet-800/30 bg-[#111118] p-8"
        >
          <h2 className="text-2xl font-bold text-white">Columns by Category</h2>
          <p className="mt-2 text-gray-400">View how many dataset columns match each analysis category.</p>

          <div className="mt-8 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                <CartesianGrid stroke="#2e2e43" vertical={false} />
                <XAxis dataKey="category" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="columns" fill="#22D3EE" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-3xl border border-violet-800/30 bg-[#111118] p-8"
        >
          <h2 className="text-2xl font-bold text-white">Column Type Distribution</h2>
          <p className="mt-2 text-gray-400">Breakdown of numeric, categorical and date columns in your dataset.</p>

          <div className="mt-8 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} innerRadius={40} paddingAngle={4}>
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-3xl border border-violet-800/30 bg-[#111118] p-8"
        >
          <h2 className="text-xl font-semibold text-white">Row Count</h2>
          <p className="mt-6 text-5xl font-black text-cyan-400">{dashboard?.profile.overview.row_count.toLocaleString()}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-3xl border border-violet-800/30 bg-[#111118] p-8"
        >
          <h2 className="text-xl font-semibold text-white">Columns</h2>
          <p className="mt-6 text-5xl font-black text-cyan-400">{dashboard?.profile.overview.column_count.toLocaleString()}</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="rounded-3xl border border-violet-800/30 bg-[#111118] p-8"
        >
          <h2 className="text-xl font-semibold text-white">Missing Values</h2>
          <p className="mt-6 text-5xl font-black text-cyan-400">{dashboard?.profile.overview.total_missing_values.toLocaleString()}</p>
        </motion.div>
      </div>
    </div>
  );
}
