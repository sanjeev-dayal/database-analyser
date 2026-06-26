import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/services/api";

type ProfileResponse = {
  dataset_id: string;
  profile: {
    overview: {
      row_count: number;
      column_count: number;
      duplicate_rows: number;
      total_missing_values: number;
      numeric_column_count: number;
      categorical_column_count: number;
      date_column_count: number;
      time_column_count: number;
    };
    numeric_statistics: Array<{
      column: string;
      min: number;
      max: number;
      mean: number;
      median: number;
      sum: number;
    }>;
    date_ranges: Array<{ column: string; min_date: string; max_date: string }>;
    top_categorical_values: Array<{ column: string; values: Array<{ value: string; count: number }> }>;
  };
};

export default function Reports() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileResponse["profile"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const datasetId = localStorage.getItem("dataset_id");

    if (!datasetId) {
      toast.error("Please upload a dataset first.");
      navigate("/");
      return;
    }

    async function loadProfile() {
      try {
        const response = await api.get<ProfileResponse>(`/datasets/${datasetId}/profile`);
        setProfile(response.data.profile);
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { detail?: string } }; message: string };
        const detail = axiosError.response?.data?.detail || axiosError.response?.data || axiosError.message;
        toast.error(`Unable to load report data: ${detail}`);
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [navigate]);

  if (loading) {
    return <div className="text-white">Loading report data...</div>;
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">Reports</h1>
        <p className="mt-2 text-gray-400 max-w-2xl">
          Review dataset profile metrics and export the most important summary insights.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-violet-800/30 bg-[#111118] p-8">
          <h2 className="text-xl font-semibold text-white">Overview</h2>
          <div className="mt-6 space-y-4 text-gray-300">
            <div className="flex items-center justify-between">
              <span>Rows</span>
              <span>{profile.overview.row_count.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Columns</span>
              <span>{profile.overview.column_count.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Duplicates</span>
              <span>{profile.overview.duplicate_rows.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Missing values</span>
              <span>{profile.overview.total_missing_values.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-violet-800/30 bg-[#111118] p-8">
          <h2 className="text-xl font-semibold text-white">Column Types</h2>
          <div className="mt-6 space-y-4 text-gray-300">
            <div className="flex items-center justify-between">
              <span>Numeric</span>
              <span>{profile.overview.numeric_column_count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Categorical</span>
              <span>{profile.overview.categorical_column_count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Date</span>
              <span>{profile.overview.date_column_count}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Time</span>
              <span>{profile.overview.time_column_count}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-violet-800/30 bg-[#111118] p-8">
          <h2 className="text-xl font-semibold text-white">Export</h2>
          <p className="mt-4 text-gray-400">Copy this dataset summary and use it for audits or business reports.</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(profile, null, 2));
              toast.success("Report summary copied to clipboard.");
            }}
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-cyan-500 to-violet-600 px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Copy Report
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-violet-800/30 bg-[#111118] p-8">
          <h2 className="text-2xl font-bold text-white">Top Numeric Statistics</h2>
          <div className="mt-6 space-y-4 text-gray-300">
            {profile.numeric_statistics.slice(0, 4).map((stat) => (
              <div key={stat.column} className="rounded-2xl bg-[#14141F] p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{stat.column}</span>
                  <span className="text-cyan-400">{stat.sum}</span>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-gray-400">Min</p>
                    <p className="font-semibold text-white">{stat.min}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Max</p>
                    <p className="font-semibold text-white">{stat.max}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-violet-800/30 bg-[#111118] p-8">
          <h2 className="text-2xl font-bold text-white">Top Categorical Values</h2>
          <div className="mt-6 space-y-4 text-gray-300">
            {profile.top_categorical_values.slice(0, 3).map((category) => (
              <div key={category.column} className="rounded-2xl bg-[#14141F] p-4">
                <p className="font-semibold text-white">{category.column}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {category.values.map((item) => (
                    <div key={item.value} className="rounded-2xl bg-[#0E0D14] p-3">
                      <p className="text-sm text-gray-400">{item.value}</p>
                      <p className="font-semibold text-white">{item.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
