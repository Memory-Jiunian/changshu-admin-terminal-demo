import { InterventionHistoryView } from "@/components/case-records/InterventionHistoryView";
import { buildWarningInterventionHistory } from "@/lib/warning-interventions";
import type { WarningInterventionAppointment, WarningInterventionRecord } from "@/types/warning";

type InterventionRecordsProps = {
  records: WarningInterventionRecord[];
  appointments: WarningInterventionAppointment[];
};

export function InterventionRecords({ records, appointments }: InterventionRecordsProps) {
  const history = buildWarningInterventionHistory({ appointments, records });

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-neutral-950">干预预约与记录</h3>
        <span className="text-xs font-medium text-neutral-500">轮次 {history.rounds.length} · 未关联 {history.unlinkedRecords.length}</span>
      </div>
      <InterventionHistoryView history={history} />
    </section>
  );
}
