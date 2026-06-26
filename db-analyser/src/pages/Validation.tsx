import { useEffect, useState } from "react";
import { type AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/services/api";
import ValidationPreview from "@/components/dashboard/ValidationPreview";

type ValidationResponse = {
  dataset_id: string;
  validation: {
    duplicate_rows: number;
    missing_values: Array<{ column: string; count: number; percent: number }>;
    empty_columns: string[];
    negative_values: Array<{ column: string; count: number }>;
    warnings: string[];
  };
};

export default function Validation() {
  const navigate = useNavigate();
  const [validation, setValidation] = useState<ValidationResponse["validation"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const datasetId = localStorage.getItem("dataset_id");

    if (!datasetId) {
      toast.error("Please upload a dataset first.");
      navigate("/");
      return;
    }

    async function loadValidation() {
      try {
        const response = await api.get<ValidationResponse>(`/datasets/${datasetId}/validation`);
        setValidation(response.data.validation);
      } catch (error: unknown) {
        const axiosError = error as AxiosError<{ detail?: string }>;
        const detail = axiosError.response?.data?.detail || axiosError.response?.data || axiosError.message;
        toast.error(`Unable to load validation: ${detail}`);
        navigate("/");
      } finally {
        setLoading(false);
      }
    }

    loadValidation();
  }, [navigate]);

  if (loading) {
    return <div className="text-white">Loading validation results...</div>;
  }

  if (!validation) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">Validation</h1>
        <p className="mt-2 text-gray-400 max-w-2xl">
          Review the dataset quality report and see exact missing, duplicate, and invalid values.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <ValidationPreview
          duplicateRows={validation.duplicate_rows}
          missingValues={validation.missing_values.reduce((total, item) => total + item.count, 0)}
        />

        <div className="space-y-6">
          <div className="rounded-3xl border border-violet-800/30 bg-[#111118] p-8">
            <h2 className="text-2xl font-bold text-white">Warnings</h2>
            <div className="mt-6 space-y-3 text-gray-300">
              {validation.warnings.length ? (
                validation.warnings.map((warning) => (
                  <div key={warning} className="rounded-2xl bg-[#14141F] p-4">
                    {warning}
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No validation warnings were found.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-violet-800/30 bg-[#111118] p-8">
            <h2 className="text-2xl font-bold text-white">Missing Values</h2>
            {validation.missing_values.length > 0 ? (
              <div className="mt-6 space-y-4">
                {validation.missing_values.map((item) => (
                  <div key={item.column} className="rounded-2xl bg-[#14141F] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-semibold text-white">{item.column}</span>
                      <span className="text-cyan-400">{item.count} ({item.percent}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-gray-400">No missing values were detected.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
