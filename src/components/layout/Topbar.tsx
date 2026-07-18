import { Bell, CircleUserRound, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAdminData } from "@/state/AdminDataProvider";

export function Topbar() {
  const { baseData, currentOperator } = useAdminData();

  return (
    <header className="flex h-16 items-center justify-between bg-neutral-900 px-6 text-white">
      <div className="text-lg font-semibold tracking-wide">{baseData.schoolConfig.schoolName}</div>
      <div className="flex items-center gap-2">
        <Button
          aria-label="搜索"
          className="text-white hover:bg-white/10 hover:text-white"
          size="icon"
          variant="ghost"
        >
          <Search className="h-5 w-5" />
        </Button>
        <Button
          aria-label="通知"
          className="text-white hover:bg-white/10 hover:text-white"
          size="icon"
          variant="ghost"
        >
          <Bell className="h-5 w-5" />
        </Button>
        <div className="ml-2 flex items-center gap-2 text-sm font-medium">
          <CircleUserRound className="h-5 w-5" />
          <span>{currentOperator.name}</span>
        </div>
      </div>
    </header>
  );
}
