import { cn } from "@/lib/utils";

export type AppPage =
  | "workbench"
  | "warning-management"
  | "student-profile"
  | "school-overview"
  | "settings";

type NavigationItem = {
  label: string;
  page: AppPage;
};

const navItems: NavigationItem[] = [
  { label: "工作台", page: "workbench" },
  { label: "预警管理", page: "warning-management" },
  { label: "学生档案", page: "student-profile" },
  { label: "校级总览", page: "school-overview" },
  { label: "系统设置", page: "settings" },
];

type SidebarProps = {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
};

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="w-44 shrink-0 bg-neutral-700 py-6 text-white">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = item.page === activePage;

          return (
            <button
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "w-full border-l-4 px-6 py-4 text-left text-base font-semibold transition-colors",
                isActive
                  ? "border-neutral-950 bg-white text-neutral-950"
                  : "border-transparent text-white hover:bg-white/10",
              )}
              key={item.label}
              onClick={() => onNavigate(item.page)}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
