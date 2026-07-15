import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { workbenchTaskLabels, type WorkbenchTaskFilter, type WorkbenchTaskType } from "@/types/workbench";

const types: WorkbenchTaskType[] = ["pending_review", "observation_due", "new_feedback", "feedback_overdue", "intervention_unscheduled", "intervention_status_pending", "retest_status_pending", "retest_result_pending", "referral_follow_up"];

export function WorkbenchTaskTypeTabs({ value, counts, onChange }: { value: WorkbenchTaskFilter; counts: Record<WorkbenchTaskType, number>; onChange: (value: WorkbenchTaskFilter) => void }) {
  return <Tabs onValueChange={(next) => onChange(next as WorkbenchTaskFilter)} value={value}>
    <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b border-neutral-200 bg-white p-3">
      <TabsTrigger value="all">全部</TabsTrigger>
      {types.map((type) => <TabsTrigger key={type} value={type}>{workbenchTaskLabels[type]} {counts[type]}</TabsTrigger>)}
    </TabsList>
  </Tabs>;
}
