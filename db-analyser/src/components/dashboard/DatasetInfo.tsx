import { Database, CheckCircle2, Clock3, HardDrive } from "lucide-react";
import { motion } from "framer-motion";

type DatasetInfoProps = {
  fileName: string;
  fileType: string;
  rows: number;
  columns: number;
  uploadedAt: string;
  fileSize?: string;
};

export default function DatasetInfo({
  fileName,
  fileType,
  rows,
  columns,
  uploadedAt,
  fileSize = "Unknown size",
}: DatasetInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="rounded-3xl border border-violet-800/30 bg-[#111118] p-7 shadow-[0_0_30px_rgba(124,58,237,.12)]"
    >
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-5">

          <div className="rounded-2xl bg-cyan-500/10 p-5">
            <Database size={38} className="text-cyan-400" />
          </div>

          <div>

            <p className="text-sm text-gray-400">
              Connected Database
            </p>

            <h2 className="mt-1 text-4xl font-bold">
              {fileName}
            </h2>

            <div className="mt-5 flex flex-wrap gap-3">

              <InfoBadge
                icon={<HardDrive size={16} />}
                text={fileType.toUpperCase()}
              />

              <InfoBadge
                icon={<Database size={16} />}
                text={`${rows.toLocaleString()} Rows`}
              />

              <InfoBadge
                icon={<Database size={16} />}
                text={`${columns.toLocaleString()} Columns`}
              />

              <InfoBadge
                icon={<Clock3 size={16} />}
                text={uploadedAt}
              />

              <InfoBadge
                icon={<HardDrive size={16} />}
                text={fileSize}
              />

            </div>

          </div>

        </div>

        <div className="rounded-full bg-emerald-500/10 px-5 py-3">

          <div className="flex items-center gap-2">

            <CheckCircle2
              className="text-emerald-400"
              size={18}
            />

            <span className="font-semibold text-emerald-400">
              Connected
            </span>

          </div>

        </div>

      </div>
    </motion.div>
  );
}

function InfoBadge({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-[#1B1B28] px-4 py-2 text-sm text-gray-300">
      {icon}
      {text}
    </div>
  );
}