import { motion } from "framer-motion";

type KPICardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
};

export default function KPICard({
  title,
  value,
  icon,
}: KPICardProps) {
  return (
    <motion.div
      whileHover={{
        y: -6,
        scale: 1.02,
      }}
      className="rounded-3xl border border-violet-800/30 bg-[#111118] p-6 transition hover:border-cyan-400/40 hover:shadow-[0_0_35px_rgba(34,211,238,.15)]"
    >
      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-gray-400">
            {title}
          </p>

          <h2 className="mt-3 text-4xl font-black text-white">
            {value}
          </h2>
        </div>

        <div className="rounded-2xl bg-cyan-500/10 p-4">
          {icon}
        </div>

      </div>
    </motion.div>
  );
}