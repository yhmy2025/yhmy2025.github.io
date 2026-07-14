# yhmy2025-tools

> 🏠 yhmy2025.github.io — GitHub Pages 工具站 | WK @ Alienware + CC @ EQ14

## 技术栈
- 纯静态 HTML/CSS/JS，无构建工具
- 部署: GitHub Pages (push main → Actions deploy)
- 本地开发: `node server.js` → http://localhost:8888
- 服务端 API: Docker 容器 (logo-brief, resume-checker 等需要后端的功能)

## 目录结构
```
/                           # 首页 + 工具卡片
├── index.html              # 主导航页
├── guide.html              # 工具指南页
├── server.js               # 本地静态服务器 (端口8888)
├── ai-writing/             # AI写作工具
├── contract-reviewer/      # 合同扫描器
├── fba-calculator/         # FBA利润计算器
├── fde/                    # FDE框架页
├── logo-brief/             # Logo设计简报
├── resume-checker/         # 简历检查器
├── services/               # 服务介绍页
├── small-accounting/       # 小记账
│   └── sub-bill/           #   订阅账单
├── thai-guide/             # 泰国指南
├── xhs-card/               # 小红书卡片生成
└── xhs-title/              # 小红书标题生成
```

## 部署
- **自动**: push 到 main 分支 → GitHub Actions → GitHub Pages
- **手动**: GitHub Actions → workflow_dispatch
- **URL**: https://yhmy2025.github.io

## 注意事项
- 所有页面均使用 GA4: `G-11MXFGVRFK`
- 需要后端 API 的功能通过 Docker 部署，前端指向 Docker API URL
- 本地测试用 `start-server.bat` 启动
- Bridge (100.87.49.51:8080) 用于 WK↔CC 文件同步

## WK↔CC 协作
- WK (Alienware) → CC (EQ14): 通过 Bridge PUT 文件
- CC 任务文件格式: `CC_TASK_YYYYMMDD.md`
- WK 任务文件格式: `WK_TASK_YYYYMMDD.md`
- Bridge token 存储在 `D:\CC_Docs\.bridge_token`
