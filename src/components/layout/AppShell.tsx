import type { PropsWithChildren } from "react";

import { Sidebar, type AppPage } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

type AppShellProps = PropsWithChildren<{
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
}>;

export function AppShell({ children, activePage, onNavigate }: AppShellProps) {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-950">
      <Topbar />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar activePage={activePage} onNavigate={onNavigate} />
        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
