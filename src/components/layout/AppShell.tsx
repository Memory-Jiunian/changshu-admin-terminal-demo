import { useState, type PropsWithChildren } from "react";

import { Sidebar, type AppPage } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { cn } from "@/lib/utils";

type AppShellProps = PropsWithChildren<{
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
}>;

export function AppShell({ children, activePage, onNavigate }: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-[var(--bg-page)] text-[var(--text-primary)]">
      <Topbar />
      <div
        className={cn(
          "grid h-[calc(100dvh-4rem)] min-h-0 transition-[grid-template-columns] duration-200",
          sidebarCollapsed
            ? "grid-cols-[64px_minmax(0,1fr)]"
            : "grid-cols-[152px_minmax(0,1fr)]",
        )}
      >
        <Sidebar
          activePage={activePage}
          collapsed={sidebarCollapsed}
          onNavigate={onNavigate}
          onToggle={() => setSidebarCollapsed((collapsed) => !collapsed)}
        />
        <main className={cn("min-h-0 min-w-0 p-6", activePage === "workbench" ? "overflow-hidden" : "overflow-y-auto")}>{children}</main>
      </div>
    </div>
  );
}
