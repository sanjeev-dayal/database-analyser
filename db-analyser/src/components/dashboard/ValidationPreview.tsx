import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function ValidationPreview() {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-3xl border border-violet-800/30 bg-[#111118] p-8"
    >
      <h2 className="mb-8 text-2xl font-bold text-white">
        Data Quality
      </h2>

      <div className="mb-8">

        <div className="mb-3 flex justify-between">

          <span className="text-gray-400">
            Overall Score
          </span>

          <span className="font-bold text-cyan-400">
            96%
          </span>

        </div>

        <div className="h-3 overflow-hidden rounded-full bg-[#232331]">

          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
            style={{ width: "96%" }}
          />

        </div>

      </div>

      <div className="space-y-5">

        <ValidationItem
          success
          label="Duplicate Rows"
          value="0"
        />

        <ValidationItem
          success={false}
          label="Missing Values"
          value="21"
        />

        <ValidationItem
          success
          label="Invalid Types"
          value="0"
        />

        <ValidationItem
          success={false}
          label="Outliers"
          value="12"
        />

      </div>
    </motion.div>
  );
}

type Props = {
  success: boolean;
  label: string;
  value: string;
};

function ValidationItem({
  success,
  label,
  value,
}: Props) {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-3">

        {success ? (
          <CheckCircle2 className="text-emerald-400" />
        ) : (
          <AlertTriangle className="text-yellow-400" />
        )}

        <span className="text-gray-300">
          {label}
        </span>

      </div>

      <span className="font-semibold text-white">
        {value}
      </span>

    </div>
  );
}