# Web工具箱（my_web_tools）

一个纯前端的「一站式离线 Web 工具箱」，面向日常数据核查与文档处理场景。所有工具**完全离线可用**：第三方库全部本地化打包，无 CDN 依赖、无后端、无账号体系。

## 工具列表

| 工具 | 路径 | 功能 |
|---|---|---|
| 终端使用时间甘特图 | `terminal-gantt/` | 时间范围数据可视化为甘特图（dhtmlxGantt），自动适配日/周/月刻度 |
| 时序图生成器 | `sequence-diagram-generator/` | 「时间, 系统, 操作」事件文本 → Mermaid 时序图，支持 PNG/SVG 导出 |
| 数据可视化 | `dataviz/` | Excel/CSV → ECharts 柱状/折线/饼图，支持导出图片（CSV 兼容 GBK 编码） |
| 通讯录查询 | `contact-search/` | Excel 通讯录导入 IndexedDB，按姓名/手机/短号精确查询，点击复制（防 XSS，支持文件内查重） |
| SELECT 子句字段组合 | `select-clause-combo/` | 两列文本按行一一对应组合 |
| 数据插入脚本生成 | `sql-insert-generator/` | Excel/CSV 文本 → Oracle 建表 + INSERT ALL 脚本（自动推断 VARCHAR2 长度、列名规范化、分批提交） |
| SQL IN 子句组合 | `sql-in-generator/` | 逐行文字拼接为 SQL IN 列表（引号/分隔符/括号/前后缀可配，单引号自动转义） |
| 文本转表格 | `text-to-table/` | 一列文本按列数切分为多列表格（适配 OCR 结果整理，兼容 CRLF 行尾） |

主入口 `index.html` 提供左侧菜单 + iframe 集成访问，也可直接打开各工具目录下的 `index.html` 独立使用。

## 技术栈

- **原生 HTML5 / CSS3 / JavaScript (ES6+)**，不依赖前端框架，零构建
- 第三方库（全部本地化）：
  - SheetJS（xlsx）—— Excel/CSV 解析
  - Dexie.js —— IndexedDB 封装（通讯录持久化）
  - Apache ECharts —— 数据可视化图表
  - dhtmlxGantt —— 甘特图
  - Mermaid + html2canvas —— 时序图渲染与导出
  - Tailwind CSS（dataviz 内）
- **统一 UI 设计系统**：根目录 `common-styles.css`（CSS 变量 + 组件类名），配套文档：
  - [UNIFIED-UI-GUIDE.md](./UNIFIED-UI-GUIDE.md) —— 完整使用指南
  - [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) —— 速查表
  - [MIGRATION-CHECKLIST.md](./MIGRATION-CHECKLIST.md) —— UI 迁移检查清单

## 快速开始

无需安装、无需构建，直接用浏览器打开根目录 `index.html` 即可（双击或 file:// 访问均可）。

浏览器要求：Chrome 90+ / Firefox 88+ / Edge 90+ / Safari 14+。

## 目录结构

```
my_web_tools/
├── index.html                  # 主入口（工具箱首页）
├── common-styles.css           # 统一 UI 设计系统
├── contact-search/             # 通讯录查询
├── dataviz/                    # 数据可视化
├── select-clause-combo/        # SELECT 子句字段组合
├── sequence-diagram-generator/ # 时序图生成器
├── sql-in-generator/           # SQL IN 子句组合
├── sql-insert-generator/       # 数据插入脚本生成
├── terminal-gantt/             # 终端使用时间甘特图
├── text-to-table/              # 文本转表格
└── example-unified/            # 统一样式示例页
```

每个工具目录遵循统一结构：`index.html`（页面）+ `app.js`（逻辑）+ `app.css`（样式）+ `README.md`（使用说明），第三方库放 `libs/` 或 `js/` 子目录。

## 部署

纯静态站点，整个目录拷贝到任意静态服务器即可（GitHub Pages / Netlify / Vercel / Nginx）。

## 开发规范

- 主页面统一命名 `index.html`，逻辑文件 `app.js`，功能说明文档用中文命名（`.md`）
- 工具文件夹用小写字母 + 连字符
- 样式遵循 `common-styles.css` 的 CSS 变量体系，覆盖时使用更高优先级选择器
- **安全约定**：外部输入（Excel 单元格、用户文本）拼入页面 HTML 前必须经 `escapeHtml()` 转义；生成 SQL 时正确处理单引号转义，不删改数据字符

## 更新日志

- 2026-10：全库代码审查并修复高危/逻辑问题——XSS 防护（通讯录/甘特图/时序图）、SQL 生成正确性（SET DEFINE OFF 替代删除 `&`、单引号转义、列名规范化）、CSV GBK 编码兼容、CRLF 行尾兼容、ECharts 实例泄漏、重复数据支持跳过导入等
- 2026-04：统一 UI 设计系统（common-styles.css）及配套文档
- 2026-03：项目结构重组，每个工具独立文件夹
