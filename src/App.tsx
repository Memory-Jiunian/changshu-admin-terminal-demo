import { AppShell } from "@/components/layout/AppShell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function App() {
  return (
    <AppShell>
      <Card className="mx-auto max-w-5xl rounded-lg border-neutral-200 bg-white shadow-none">
        <CardHeader>
          <CardTitle className="text-xl">Phase 1：项目搭建</CardTitle>
          <CardDescription>
            已完成管理终端基础壳布局，预警管理业务页面将在后续阶段实现。
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-neutral-600">
          当前版本只包含深色顶栏、深色左侧导航和浅色主内容区，未接入后端，也未实现业务列表或详情抽屉。
        </CardContent>
      </Card>
    </AppShell>
  );
}

