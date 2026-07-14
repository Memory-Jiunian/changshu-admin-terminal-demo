import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import type { AppPage } from "@/components/layout/Sidebar";
import { StudentProfilePage } from "@/components/student-profile/StudentProfilePage";
import { WarningManagementPage } from "@/components/warning/WarningManagementPage";

export default function App() {
  const [activePage, setActivePage] = useState<AppPage>("warning-management");

  return (
    <AppShell activePage={activePage} onNavigate={setActivePage}>
      {activePage === "student-profile" ? (
        <StudentProfilePage />
      ) : (
        <WarningManagementPage />
      )}
    </AppShell>
  );
}
