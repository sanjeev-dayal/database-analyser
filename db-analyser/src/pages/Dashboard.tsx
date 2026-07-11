import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import DatasetInfo from "@/components/dashboard/DatasetInfo";
import KPICard from "@/components/dashboard/KPICard";
import ChartPreview from "@/components/dashboard/ChartPreview";
import ValidationPreview from "@/components/dashboard/ValidationPreview";
import api from "@/services/api";

import {
  Table,
  Columns3,
  CircleAlert,
  BrainCircuit,
} from "lucide-react";

type DashboardPayload = {
  dataset_id: string;
  schema: {
    row_count: number;
    column_count: number;
    columns: Array<{ name: string }>;
    numeric_columns: string[];
    categorical_columns: string[];
    date_columns: string[];
  };
  validation: {
    duplicate_rows: number;
    missing_values: Array<{ column: string; count: number }>;
  };
  profile: {
    overview: {
      row_count: number;
      column_count: number;
      duplicate_rows: number;
      total_missing_values: number;
    };
  };
  categories: Array<{ name: string; columns: string[] }>;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const datasetId = localStorage.getItem("dataset_id");

    if (!datasetId) {
      toast.error("Please upload a dataset first.");
      navigate("/");
      return;
    }

    async function loadDashboard() {
      try {
        const response = await api.get<DashboardPayload>(`/datasets/${datasetId}/dashboard`);
        setDashboardData(response.data);
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { detail?: string } }; message: string };
        const detail = axiosError.response?.data?.detail || axiosError.response?.data || axiosError.message;
        toast.error(`Unable to load dashboard: ${detail}`);
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="text-center text-white py-24">
        <p className="text-xl">Loading dashboard...</p>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="space-y-8">

      <DatasetInfo
        fileName={
          localStorage.getItem("dataset_filename") || dashboardData.dataset_id
        }
        fileType={
          localStorage.getItem("dataset_file_type") || "csv"
        }
        rows={dashboardData.profile.overview.row_count}
        columns={dashboardData.profile.overview.column_count}
        uploadedAt={
          localStorage.getItem("dataset_uploaded_at")
            ? new Date(localStorage.getItem("dataset_uploaded_at")!).toLocaleString()
            : "Just now"
        }
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <KPICard
          title="Rows"
          value={dashboardData.profile.overview.row_count.toLocaleString()}
          icon={<Table className="text-cyan-400" />}
        />

        <KPICard
          title="Columns"
          value={dashboardData.profile.overview.column_count.toLocaleString()}
          icon={<Columns3 className="text-cyan-400" />}
        />

        <KPICard
          title="Duplicate Rows"
          value={dashboardData.profile.overview.duplicate_rows.toLocaleString()}
          icon={<CircleAlert className="text-cyan-400" />}
        />

        <KPICard
          title="Missing Values"
          value={dashboardData.profile.overview.total_missing_values.toLocaleString()}
          icon={<BrainCircuit className="text-cyan-400" />}
        />

      </div>
      
      <div className="grid gap-6 xl:grid-cols-3">

        <div className="xl:col-span-2">
          <ChartPreview
            schema={dashboardData.schema}
            categories={dashboardData.categories}
          />
        </div>

        <ValidationPreview
          duplicateRows={dashboardData.validation.duplicate_rows}
          missingValues={dashboardData.validation.missing_values.reduce(
            (total, item) => total + item.count,
            0
          )}
        />

      </div>

    </div>
  );
}