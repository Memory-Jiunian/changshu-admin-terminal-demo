import type { PropsWithChildren } from "react";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-950">
      <Topbar />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="min-w-0 flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

