import { cn } from "@/lib/utils";

const navItems = ["工作台", "预警管理", "干预记录", "学生档案", "校级总览"];

export function Sidebar() {
  return (
    <aside className="w-44 shrink-0 bg-neutral-700 py-6 text-white">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = item === "预警管理";

          return (
            <button
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "w-full border-l-4 px-6 py-4 text-left text-base font-semibold transition-colors",
                isActive
                  ? "border-neutral-950 bg-white text-neutral-950"
                  : "border-transparent text-white hover:bg-white/10",
              )}
              key={item}
              type="button"
            >
              {item}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

