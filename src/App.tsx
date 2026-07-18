import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { SchoolOverviewPage } from "@/components/school-overview/SchoolOverviewPage";
import { SystemSettingsPage } from "@/components/settings/SystemSettingsPage";
import type { AppPage } from "@/components/layout/Sidebar";
import { StudentProfilePage } from "@/components/student-profile/StudentProfilePage";
import { WarningManagementPage } from "@/components/warning/WarningManagementPage";
import { WorkbenchPage } from "@/components/workbench/WorkbenchPage";
import { AdminDataProvider } from "@/state/AdminDataProvider";
import type { StudentProfileReturnState, StudentProfileWarningReturnContext } from "@/types/navigation";
import type { WorkbenchNavigationTarget, WorkbenchReturnContext } from "@/types/workbench";

export default function App() {
  const [activePage, setActivePage] = useState<AppPage>("workbench");
  const [profileReturnContext, setProfileReturnContext] = useState<StudentProfileWarningReturnContext | null>(null);
  const [workbenchNavigation, setWorkbenchNavigation] = useState<WorkbenchNavigationTarget | null>(null);
  const [workbenchReturnContext, setWorkbenchReturnContext] = useState<WorkbenchReturnContext | undefined>();
  const [workbenchNotice, setWorkbenchNotice] = useState("");

  function handleOpenWarningDetail(
    warningId: string,
    profileState: StudentProfileReturnState,
  ) {
    setProfileReturnContext({ source: "student-profile", warningId, profileState });
    setWorkbenchNavigation(null);
    setActivePage("warning-management");
  }

  function handleOpenWorkbenchWarning(target: WorkbenchNavigationTarget) {
    setWorkbenchNavigation(target);
    setWorkbenchReturnContext(target.returnContext);
    setWorkbenchNotice("");
    setProfileReturnContext(null);
    setActivePage("warning-management");
  }

  function handleReturnToWorkbench() {
    if (workbenchNavigation) setWorkbenchReturnContext(workbenchNavigation.returnContext);
    setWorkbenchNavigation(null);
    setActivePage("workbench");
  }

  function handleWorkbenchNavigationFailure(message: string) {
    if (workbenchNavigation) setWorkbenchReturnContext(workbenchNavigation.returnContext);
    setWorkbenchNotice(message);
    setWorkbenchNavigation(null);
    setActivePage("workbench");
  }

  function handleNavigate(page: AppPage) {
    setProfileReturnContext(null);
    setWorkbenchNavigation(null);
    setWorkbenchNotice("");
    setActivePage(page);
  }

  function renderPage() {
    switch (activePage) {
      case "workbench":
        return (
          <WorkbenchPage
            initialReturnContext={workbenchReturnContext}
            notice={workbenchNotice}
            onOpenWarning={handleOpenWorkbenchWarning}
          />
        );
      case "student-profile":
        return (
          <StudentProfilePage
            initialReturnState={profileReturnContext?.profileState}
            onOpenWarningDetail={handleOpenWarningDetail}
          />
        );
      case "warning-management":
        return (
          <WarningManagementPage
            initialSelectedWarningId={profileReturnContext?.warningId ?? workbenchNavigation?.warningId}
            onReturnToStudentProfile={profileReturnContext ? () => setActivePage("student-profile") : undefined}
            onReturnToWorkbench={workbenchNavigation ? handleReturnToWorkbench : undefined}
            onWorkbenchNavigationFailure={handleWorkbenchNavigationFailure}
            workbenchNavigation={workbenchNavigation}
          />
        );
      case "school-overview":
        return <SchoolOverviewPage />;
      case "settings":
        return <SystemSettingsPage />;
    }
  }

  return (
    <AdminDataProvider>
      <AppShell activePage={activePage} onNavigate={handleNavigate}>
        {renderPage()}
      </AppShell>
    </AdminDataProvider>
  );
}
