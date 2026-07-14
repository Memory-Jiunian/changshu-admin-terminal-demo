import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import type { AppPage } from "@/components/layout/Sidebar";
import { StudentProfilePage } from "@/components/student-profile/StudentProfilePage";
import { WarningManagementPage } from "@/components/warning/WarningManagementPage";
import { AdminDataProvider } from "@/state/AdminDataProvider";
import type { StudentProfileReturnState, StudentProfileWarningReturnContext } from "@/types/navigation";

export default function App() {
  const [activePage, setActivePage] = useState<AppPage>("warning-management");
  const [returnContext, setReturnContext] = useState<StudentProfileWarningReturnContext | null>(null);

  function handleOpenWarningDetail(
    warningId: string,
    profileState: StudentProfileReturnState,
  ) {
    setReturnContext({ source: "student-profile", warningId, profileState });
    setActivePage("warning-management");
  }

  function handleNavigate(page: AppPage) {
    setReturnContext(null);
    setActivePage(page);
  }

  return (
    <AdminDataProvider>
      <AppShell activePage={activePage} onNavigate={handleNavigate}>
        {activePage === "student-profile" ? (
          <StudentProfilePage
            initialReturnState={returnContext?.profileState}
            onOpenWarningDetail={handleOpenWarningDetail}
          />
        ) : (
          <WarningManagementPage
            initialSelectedWarningId={returnContext?.warningId}
            onReturnToStudentProfile={returnContext ? () => setActivePage("student-profile") : undefined}
          />
        )}
      </AppShell>
    </AdminDataProvider>
  );
}
