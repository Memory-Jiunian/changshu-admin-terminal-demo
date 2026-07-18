# 管理终端视觉 Token V1

本规范只统一视觉语言，不改变业务状态、统计口径、页面结构、Mock 或隐私规则。

## 基础原则

- 保留深色顶栏和侧边栏。
- 内容区使用 `--bg-page`，表面使用 `--bg-card`。
- 主按钮使用 `--primary-600`，链接和图表可使用 `--primary-500`。
- 纯展示 Card 不提供明显 Hover；仅 `data-interactive="true"` 的 Card 提供 Hover 和 Focus。
- Dialog 与 Drawer 只映射表面和文字 Token，不改变现有尺寸、Header、Body、Footer 结构。

## 领域颜色

- 中风险：品牌蓝。
- 高风险：警告橙。
- 危险风险：危险红。
- 已闭环：成功绿。
- 观察中：紫色。
- 待复测：青色。
- 低风险事实：中性样式，不映射为成功绿。

## 图表

通用序列使用 `chart-blue / green / orange / purple / cyan / red`。风险业务图表优先使用中风险蓝、高风险橙、危险红；正式预警趋势使用蓝，闭环趋势使用绿。
