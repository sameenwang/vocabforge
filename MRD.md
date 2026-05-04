# VocabForge — 产品需求文档 (MRD)

## 1. 产品概述

**VocabForge** 是一款双语台词单词学习工具。用户上传中英文台词对 + 单词列表，自动生成带高亮标记和学习思考的结构化 Markdown 学习笔记，支持 PDF 导出。

核心价值：通过影视/剧集语境 + AI 教师点评，让单词记忆从孤立背诵变为情景理解。

## 2. 目标用户

- 英语学习者（中高级），希望通过影视剧提升词汇量
- 语言教师/培训师，需要快速制作双语学习材料
- 留学备考者（托福/雅思/GRE），希望结合语境背单词

## 3. 用户场景

| 场景 | 描述 |
|------|------|
| 追剧学单词 | 用户下载剧集双语字幕 + 单词表，一键生成学习笔记 |
| 课堂讲义 | 教师用台词汇编 + 课程词汇表，生成课堂 handout |
| 自学整理 | 阅读英文材料时摘录句子 + 生词，整理为复习笔记 |

## 4. 功能需求

### 4.1 优先级 P0（核心流程）

| 功能 | 说明 |
|------|------|
| 台词输入 | 支持粘贴文本 / 上传 PDF / Word / Excel / TXT / MD 文件 |
| 单词输入 | 同上，每行一个单词 |
| 词形匹配 | 自动匹配单词的变形（复数、时态、动名词）+ 不规则形式 |
| 高亮标记 | 台词中匹配的单词用 `==**word**==` → 黄色高亮 `<mark>` 显示 |
| 表格输出 | Markdown 双列表格：左台词 / 右单词释义 + AI 思考点评 |
| Markdown 下载 | 导出 `.md` 文件 |
| PDF 下载 | 浏览器打印 → 导出 PDF，含分页页码 |

### 4.2 优先级 P1（体验增强）

| 功能 | 说明 |
|------|------|
| 样本数据 | 一键加载示例数据（疑犯追踪 S01E01），快速体验 |
| 文件格式提示 | 输入区展示支持的文件格式标签 |
| 学习笔记预览 | 结果区直接在网页渲染 Markdown 表格 |
| 紧凑 PDF 样式 | 打印 CSS 优化：缩小字体、压缩间距、去背景色 |
| 中文时间戳 | 台词中文行末尾标记剧中时间戳（如 `00:08`） |

### 4.3 优先级 P2（未来方向）

- 词库管理（收藏/复习/导出 Anki）
- 用户系统 + 历史记录
- 暗色模式
- 多语言支持（日/韩/法）
- OpenAI / LLM 生成更自然的例句

## 5. 技术架构

```
用户浏览器
    │
    ▼
Next.js 前端 (Port 3000)
    │  API Proxy (/api/*)
    ▼
FastAPI 后端 (Port 8000)
    │
    ├─ POST /api/process       ← 处理台词 + 单词 → Markdown
    └─ POST /api/extract-file  ← 解析 PDF/Word/Excel → 文本
```

### 核心处理引擎 (`processor.py`)

1. **文本分割** — Unicode 码位判断中/英文：`>= 0x2000` 为中文
2. **清洗配对** — 去重、过滤非对白行（`[]` 标注的行）
3. **词形匹配** — 对每个单词生成 inflection 表（s/es/ed/ing + 不规则形式）
4. **格式化** — 双列 Markdown 表格 + 拼音/释义/AI 思考

### 部署方式

项目支持两种部署方式：

#### 方式一：Docker Compose（推荐）

```
# 项目根目录已包含：
vocabforge/
├── docker-compose.yml          # 一键编排
├── backend/
│   ├── Dockerfile              # Python 3.12-slim 镜像
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile              # Node 20 多阶段构建 (standalone)
│   ├── .dockerignore
│   └── next.config.mjs         # output: "standalone"
└── .env.example
```

```bash
docker compose up -d --build
# 访问 http://localhost:3000
```

前端通过 `NEXT_PUBLIC_BACKEND_URL` 环境变量连接后端，Docker 网络中设为 `http://backend:8000`。

#### 方式二：手动运行

```bash
# 终端 1 — 后端
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000

# 终端 2 — 前端
cd frontend
npm install
npm run dev                # 开发模式 (端口 3000)
# 或
npm run build && npm start # 生产模式
```

#### 方式三：公网部署（他人可访问）

| 组件 | 平台 | 费用 | 地址 |
|------|------|------|------|
| 前端 | Vercel | 免费 | https://frontend-seven-tau-48.vercel.app |
| 后端 | Render (免费方案) | 免费 | https://vocabforge-backend.onrender.com |

部署步骤：
1. 后端代码推送到 GitHub → Render 导入项目 → 自动部署
2. 前端在 Vercel 设置环境变量 `NEXT_PUBLIC_BACKEND_URL` = 后端公网地址

> Render 免费方案超过 15 分钟无访问会休眠，下次请求需等待 30-60 秒冷启动。

## 6. 关键指标

| 指标 | 目标 |
|------|------|
| 后端处理延迟 | < 30s（40 组台词 + 40 单词） |
| 文件解析延迟 | < 5s（PDF 50 页以内） |
| 首屏加载 | < 2s（生产构建） |
| PDF 导出 | 同等内容比默认打印紧凑 50%+ |

## 7. 竞品分析

| 产品 | 定位 | VocabForge 差异 |
|------|------|-----------------|
| Anki | 间隔重复卡片 | 无语境关联，需手动制作卡片 |
| 欧路词典 | 查词/划词翻译 | 不生成结构化笔记 |
| Readlang | 阅读中查词 | 不支持台词对白模式 |
| 沉浸式翻译 | 双语对照阅读 | 不生成单词学习内容 |

VocabForge 填补了"台词语境 × 单词学习 × AI 点评"的空白。

## 8. 版本记录

| 版本 | 日期 | 变更 |
|------|------|------|
| v0.1.0 | 2026-05-04 | MVP：核心处理引擎 + Web 界面 + 文件上传 + PDF 导出 |
| v0.1.1 | 2026-05-04 | 部署上线：Vercel (前端) + Render (后端) |

---

*文档更新日期：2026-05-04*

---

## 附录：部署情况

### 已上线

| 组件 | 平台 | 地址 |
|:---|:---|:---|
| 前端 | Vercel | https://frontend-seven-tau-48.vercel.app |
| 后端 | Render (免费方案) | https://vocabforge-backend.onrender.com |

### 国内网络推送代码

在国内推送代码到 GitHub 需配置 Clash 代理：

```bash
git config --global http.proxy http://127.0.0.1:7897
git config --global https.proxy http://127.0.0.1:7897
git push
git config --global --unset http.proxy
git config --global --unset https.proxy
```

端口根据实际 Clash HTTP 代理端口调整。
