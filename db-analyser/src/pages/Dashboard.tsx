import DatasetInfo from "@/components/dashboard/DatasetInfo";
import KPICard from "@/components/dashboard/KPICard";
import AISummary from "@/components/dashboard/AISummary";
import ChartPreview from "@/components/dashboard/ChartPreview";
import RecentQuestions from "@/components/dashboard/RecentQuestions";
import ValidationPreview from "@/components/dashboard/ValidationPreview";

import {
  Table,
  Columns3,
  CircleAlert,
  BrainCircuit,
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-8">

      <DatasetInfo />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

        <KPICard
          title="Rows"
          value="54,820"
          icon={<Table className="text-cyan-400" />}
        />

        <KPICard
          title="Columns"
          value="16"
          icon={<Columns3 className="text-cyan-400" />}
        />

        <KPICard
          title="Null Values"
          value="21"
          icon={<CircleAlert className="text-cyan-400" />}
        />

        <KPICard
          title="AI Score"
          value="96%"
          icon={<BrainCircuit className="text-cyan-400" />}
        />

      </div>
      
      <div className="grid gap-6 xl:grid-cols-3">

        <div className="xl:col-span-2">
          <ChartPreview />
        </div>

        <ValidationPreview />

      </div>

      <div className="grid gap-6 xl:grid-cols-2">

        <AISummary />

        <RecentQuestions />

      </div>

    </div>
  );
}