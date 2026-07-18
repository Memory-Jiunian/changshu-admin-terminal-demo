import { useCallback, useState } from "react";
import { ShieldCheck } from "lucide-react";

import { BatchImportPanel } from "@/components/settings/BatchImportPanel";
import { LeaveConfirmDialog } from "@/components/settings/SettingsShared";
import { OrganizationSettingsPanel } from "@/components/settings/OrganizationSettingsPanel";
import { SchoolSettingsPanel } from "@/components/settings/SchoolSettingsPanel";
import { StudentSettingsPanel } from "@/components/settings/StudentSettingsPanel";
import { TeacherSettingsPanel } from "@/components/settings/TeacherSettingsPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminData } from "@/state/AdminDataProvider";
import type { SystemSettingsTab } from "@/types/system-settings";

const tabs: { value: SystemSettingsTab; label: string }[] = [
  { value: "school", label: "学校信息" },
  { value: "organization", label: "组织架构" },
  { value: "teachers", label: "教师管理" },
  { value: "students", label: "学生管理" },
  { value: "import", label: "批量导入" },
];

export function SystemSettingsPage() {
  const { currentOperator } = useAdminData();
  const [activeTab, setActiveTab] = useState<SystemSettingsTab>("school");
  const [schoolDirty, setSchoolDirty] = useState(false);
  const [pendingTab, setPendingTab] = useState<SystemSettingsTab | null>(null);
  const handleDirtyChange = useCallback((dirty: boolean) => setSchoolDirty(dirty), []);

  function requestTab(tab: SystemSettingsTab) {
    if (activeTab === "school" && schoolDirty && tab !== activeTab) {
      setPendingTab(tab);
      return;
    }
    setActiveTab(tab);
  }

  return (
    <section className="mx-auto max-w-[1440px] space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--text-title)]">系统设置</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">维护各业务模块共同依赖的学校、组织、教师和学生基础资料。</p>
      </header>
      <div className="flex items-start gap-3 rounded-lg border border-[var(--primary-200)] bg-[var(--primary-50)] p-4 text-sm text-[var(--primary-700)]">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
        <div><div className="font-semibold">当前演示账号具备资料维护权限</div><div className="mt-1 text-xs">操作人：{currentOperator.name}。本版本仅模拟授权边界，不实现真实登录、密码或权限配置。</div></div>
      </div>
      <Tabs onValueChange={(value) => requestTab(value as SystemSettingsTab)} value={activeTab}>
        <div className="overflow-x-auto">
          <TabsList className="min-w-max">
            {tabs.map((tab) => <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>)}
          </TabsList>
        </div>
        <TabsContent value="school"><SchoolSettingsPanel onDirtyChange={handleDirtyChange} /></TabsContent>
        <TabsContent value="organization"><OrganizationSettingsPanel /></TabsContent>
        <TabsContent value="teachers"><TeacherSettingsPanel /></TabsContent>
        <TabsContent value="students"><StudentSettingsPanel /></TabsContent>
        <TabsContent value="import"><BatchImportPanel /></TabsContent>
      </Tabs>
      <LeaveConfirmDialog
        onCancel={() => setPendingTab(null)}
        onConfirm={() => {
          setSchoolDirty(false);
          if (pendingTab) setActiveTab(pendingTab);
          setPendingTab(null);
        }}
        open={Boolean(pendingTab)}
      />
    </section>
  );
}
