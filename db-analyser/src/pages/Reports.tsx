import { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, Tooltip, CartesianGrid } from "recharts";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
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

type ChartConfig = {
  type: "bar" | "line" | "pie";
  x: string;
  y: string;
};

type SessionQuestionItem = {
  title: string;
  description: string;
  sql: string;
  summary: string;
  rows: Array<Record<string, unknown>>;
  chart: ChartConfig;
};

const SESSION_STORAGE_KEY = (datasetId: string) => `report_session_results_${datasetId}`;

export default function Reports() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileResponse["profile"] | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState<SessionQuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

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

        const rawSession = localStorage.getItem(SESSION_STORAGE_KEY(datasetId));
        if (rawSession) {
          setSessionQuestions(JSON.parse(rawSession));
        }
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

  function getDatasetLabel() {
    const filename = localStorage.getItem("dataset_filename");
    const uploadedAt = localStorage.getItem("dataset_uploaded_at");

    if (filename && uploadedAt) {
      return `${filename} @ ${new Date(uploadedAt).toLocaleString()}`;
    }

    if (filename) {
      return filename;
    }

    return "Dataset";
  }

  function getDatasetFileName() {
    return localStorage.getItem("dataset_filename") || "dataset.csv";
  }

  function getDatasetUploadedAt() {
    const uploadedAt = localStorage.getItem("dataset_uploaded_at");
    return uploadedAt ? new Date(uploadedAt).toLocaleString() : "Unknown upload time";
  }

  function getPdfFileName() {
    const filename = getDatasetFileName();
    const safeName = filename.replace(/[^a-zA-Z0-9-_]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    return `validation-report-${safeName}-${timestamp}.pdf`;
  }

  function prepareChartData(rows: Array<Record<string, unknown>>, chart: ChartConfig) {
    return rows.map((row) => ({
      label: String(row[chart.x] ?? ""),
      value: Number(row[chart.y]) || 0,
    }));
  }

  function addPageHeader(doc: jsPDF, title: string, subtitle: string, pageWidth: number, pageHeight: number, headerMeta?: string) {
    doc.setFillColor(15, 23, 43);
    doc.rect(0, 0, pageWidth, 64, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text(title, 24, 30);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(140, 215, 255);
    doc.text(subtitle, 24, 46);

    if (headerMeta) {
      doc.setFontSize(9);
      doc.setTextColor(190, 210, 255);
      doc.text(headerMeta, pageWidth - 24, 30, { align: "right" });
    }

    doc.setDrawColor(80, 100, 140);
    doc.setLineWidth(0.8);
    doc.line(24, 62, pageWidth - 24, 62);
  }

  function addPageFooter(doc: jsPDF, pageWidth: number, pageHeight: number) {
    const pageNumber = doc.internal.getNumberOfPages();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 130, 150);
    doc.text(`Page ${pageNumber}`, pageWidth - 24, pageHeight - 24, { align: "right" });
  }

  function drawKeyValue(doc: jsPDF, label: string, value: string | number, x: number, y: number) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(24, 28, 36);
    doc.text(label, x, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(18, 20, 26);
    doc.text(String(value), x + 90, y);
  }

  function ensurePdfSpace(doc: jsPDF, y: number, minimumHeight: number, pageHeight: number, pageWidth: number) {
    if (y + minimumHeight > pageHeight - 60) {
      doc.addPage();
      addPageHeader(doc, "DB Analyzer", "Validation Report", pageWidth, pageHeight, getDatasetLabel());
      addPageFooter(doc, pageWidth, pageHeight);
      return 90;
    }
    return y;
  }

  function drawChart() {
    // Charts are intentionally omitted from PDF export to keep the report text-focused.
    return;
  }

  async function downloadReportPdf() {
    setExporting(true);

    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let y = 60;

      addPageHeader(doc, "DB Analyzer", "Validation Report", pageWidth, pageHeight, getDatasetLabel());
      addPageFooter(doc, pageWidth, pageHeight);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(44, 62, 80);
      doc.text(`${getDatasetFileName()} • ${getDatasetUploadedAt()}`, 24, 70);
      y = 100;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(20, 34, 58);
      doc.text("Dataset summary", 24, y);
      y += 18;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(32, 44, 64);
      doc.text(
        `This validation report covers the uploaded CSV file and highlights row counts, column types, duplicate rows, and missing values. Missing values are reported to help identify data quality gaps before analytics.`,
        24,
        y,
        { maxWidth: pageWidth - 48 }
      );
      y += 40;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(20, 34, 58);
      doc.text("Overview", 24, y);
      y += 18;

      drawKeyValue(doc, "Rows:", profile.overview.row_count, 24, y);
      drawKeyValue(doc, "Columns:", profile.overview.column_count, 24, y + 14);
      drawKeyValue(doc, "Duplicates:", profile.overview.duplicate_rows, 24, y + 28);
      drawKeyValue(doc, "Missing values:", profile.overview.total_missing_values, 24, y + 42);
      y += 70;

      if (sessionQuestions.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
      doc.setTextColor(18, 20, 26);

        for (const item of sessionQuestions) {
          y = ensurePdfSpace(doc, y, 120, pageHeight, pageWidth);

          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.setTextColor(18, 30, 50);
          doc.text(item.title, 24, y);
          y += 16;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(32, 44, 64);
          doc.text(item.description, 24, y, { maxWidth: pageWidth - 48 });
          y += 22;

          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(18, 20, 26);
          doc.text("Summary:", 24, y);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(18, 20, 26);
          doc.text(item.summary, 24, y + 12, { maxWidth: pageWidth - 48 });
          y += 32;

          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(18, 20, 26);
          doc.text("SQL:", 24, y);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(18, 20, 26);
          doc.text(item.sql, 24, y + 12, { maxWidth: pageWidth - 48 });
          y += 50;

          if (y > pageHeight - 120) {
            doc.addPage();
            addPageHeader(doc, "DB Analyzer", "Validation Report", pageWidth, pageHeight, getDatasetLabel());
            addPageFooter(doc, pageWidth, pageHeight);
            y = 90;
          }
        }
      }

      y = ensurePdfSpace(doc, y, 90, pageHeight, pageWidth);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(18, 20, 26);
      doc.text("Report conclusion", 24, y);
      y += 18;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(18, 20, 26);
      doc.text(
        `The dataset ${getDatasetFileName()} was analyzed for structure and quality. The report includes executed queries and summaries. Review the results above to prioritize missing values, duplicate rows, and data distribution before downstream analytics.`,
        24,
        y,
        { maxWidth: pageWidth - 48 }
      );

      doc.save(getPdfFileName());
    } catch (error) {
      console.error(error);
      toast.error("Unable to generate PDF report. Try again.");
    } finally {
      setExporting(false);
    }
  }

  function renderChartPreview(rows: Array<Record<string, unknown>>, chart: ChartConfig) {
    if (!rows.length) {
      return <p className="text-gray-400">No chart rows available.</p>;
    }

    const chartData = rows.map((row) => ({
      ...row,
      value: Number(row[chart.y]) ?? 0,
    }));

    if (chart.type === "line") {
      return (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
            <Pie data={chartData} dataKey="value" nameKey={chart.x} outerRadius={90} fill="#22D3EE">
              {chartData.map((entry, index) => (
                <Cell key={`${entry[chart.x]}-${index}`} fill={["#22D3EE", "#7C3AED", "#A855F7", "#F472B6", "#FBBF24"][index % 5]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#2e2e43" vertical={false} />
          <XAxis dataKey={chart.x} stroke="#9CA3AF" />
          <Tooltip />
          <Bar dataKey="value" fill="#22D3EE" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <>
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
          <p className="mt-4 text-gray-400">
            Download a PDF version of this validation report with the session questions and answers.
          </p>
          <button
            onClick={downloadReportPdf}
            disabled={exporting}
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-cyan-500 to-violet-600 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {exporting ? "Generating PDF..." : "Download Report PDF"}
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

        <div className="rounded-3xl border border-violet-800/30 bg-[#111118] p-8">
          <h2 className="text-2xl font-bold text-white">Session Questions</h2>
          {sessionQuestions.length === 0 ? (
            <p className="mt-4 text-gray-400">No session questions have been executed yet.</p>
          ) : (
            <div className="mt-6 space-y-6">
              {sessionQuestions.map((item) => (
                <div key={item.title} className="rounded-3xl border border-violet-800/20 bg-[#14141F] p-6">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">{item.title}</p>
                      <p className="mt-2 text-gray-400">{item.description}</p>
                    </div>
                    <div className="rounded-2xl bg-[#0E0D14] px-4 py-2 text-sm text-cyan-200">
                      {item.rows.length} rows returned
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div className="rounded-2xl bg-[#111118] p-4">
                      <p className="text-sm uppercase tracking-[0.16em] text-gray-400">Summary</p>
                      <p className="mt-2 text-gray-200">{item.summary}</p>
                    </div>
                    <div className="rounded-2xl bg-[#111118] p-4">
                      <p className="text-sm uppercase tracking-[0.16em] text-gray-400">SQL</p>
                      <pre className="mt-2 overflow-x-auto text-sm text-green-200">{item.sql}</pre>
                    </div>
                    <div className="rounded-2xl bg-[#111118] p-4">
                      <p className="font-semibold text-white">Chart preview</p>
                      <div className="mt-4 h-56">{renderChartPreview(item.rows, item.chart)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
