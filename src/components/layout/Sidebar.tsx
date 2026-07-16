import {
  BarChart3,
  BellRing,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Settings,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type AppPage =
  | "workbench"
  | "warning-management"
  | "student-profile"
  | "school-overview"
  | "settings";

type NavigationItem = {
  icon: LucideIcon;
  label: string;
  page: AppPage;
};

const navItems: NavigationItem[] = [
  { icon: LayoutDashboard, label: "工作台", page: "workbench" },
  { icon: BellRing, label: "预警管理", page: "warning-management" },
  { icon: UsersRound, label: "学生档案", page: "student-profile" },
  { icon: BarChart3, label: "校级总览", page: "school-overview" },
  { icon: Settings, label: "系统设置", page: "settings" },
];

type SidebarProps = {
  activePage: AppPage;
  collapsed: boolean;
  onNavigate: (page: AppPage) => void;
  onToggle: () => void;
};

export function Sidebar({ activePage, collapsed, onNavigate, onToggle }: SidebarProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className={cn(
          "relative h-full w-full bg-neutral-700 py-4 text-white",
        )}
      >
        <nav aria-label="主导航" className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.page === activePage;
            const Icon = item.icon;

            const navigationButton = (
              <button
                aria-current={isActive ? "page" : undefined}
                aria-label={collapsed ? item.label : undefined}
                className={cn(
                  "flex w-full items-center border-l-4 py-3 text-sm font-semibold transition-colors",
                  collapsed ? "justify-center px-0" : "gap-3 px-4",
                  isActive
                    ? "border-neutral-950 bg-white text-neutral-950"
                    : "border-transparent text-white hover:bg-white/10",
                )}
                onClick={() => onNavigate(item.page)}
                type="button"
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed ? <span>{item.label}</span> : null}
              </button>
            );

            return collapsed ? (
              <Tooltip key={item.page}>
                <TooltipTrigger asChild>{navigationButton}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              <div key={item.page}>{navigationButton}</div>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-0 w-full px-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label={collapsed ? "展开侧边导航" : "折叠侧边导航"}
                className={cn(
                  "w-full text-white hover:bg-white/10 hover:text-white",
                  collapsed ? "px-0" : "justify-start gap-2",
                )}
                onClick={onToggle}
                size={collapsed ? "icon" : "sm"}
                type="button"
                variant="ghost"
              >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                {!collapsed ? <span>折叠导航</span> : null}
              </Button>
            </TooltipTrigger>
            {collapsed ? <TooltipContent side="right">展开导航</TooltipContent> : null}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
