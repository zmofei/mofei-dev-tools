# Mofei 开发工具集

Mofei Dev Tools 是一个免费的浏览器工具集，面向日常开发、API/JSON 调试、GIS 与地图处理、MongoDB ObjectID 检查、Base64 转换和跨时区协作。大多数工具在浏览器本地运行，不需要注册，适合快速开发工作流。

**[中文文档](README.zh.md) | [English](README.md)**

## 在线地址

生产环境：[https://tools.mofei.life](https://tools.mofei.life)

## 适合谁

- 前端和后端开发者，用于调试 API payload、编码、ID 和数据格式。
- GIS 和地图开发者，用于准备坐标、边界框和 GeoJSON 预览。
- 分布式团队，用于比较城市时间、工作时间重叠和可分享的会议时间配置。

## 工具列表

### 开发工具

- **文本 Base64 转换**（`/base64`）：把普通文本编码为 Base64，或把 Base64 解码为可读 UTF-8 文本。
- **图片转 Base64 转换器**（`/base64-image`）：把 PNG、JPG、WebP、SVG、GIF、AVIF 图片转换为 Base64 Data URL，并支持即时预览。
- **JSON 格式化与查看**（`/json-format`）：格式化、压缩、校验 JSON，并用可折叠树形视图查看结构。
- **JSON 路径提取**（`/json-extract`）：使用 JSONPath 风格表达式提取 JSON 字段，支持对比和导出结果。
- **MongoDB ObjectID 生成器**（`/objectid`）：生成 ObjectID、查看时间戳，并支持按自定义时间生成 ID。

### 效率工具

- **世界时间对照**（`/time`）：对比城市时间、日期差异和工作时间重叠，并分享跨时区会议配置。

### GIS 与地图工具

- **BBox 绘制工具**（`/bbox`）：在交互式地图上绘制、预览、解析、分享和复制边界框。
- **GeoJSON 预览**（`/geojson`）：为 GeoJSON 数据生成 geojson.io 预览链接，并支持通过 GitHub device flow 创建较大数据的 Gist 预览。
- **GIS 坐标转换**（`/coordinate-converter`）：转换 WGS84、GCJ-02、BD-09、UTM、Web Mercator 等坐标系统。

## 技术栈

- **框架**：Next.js 15 App Router
- **运行时/UI**：React 19、TypeScript、`@mofei-dev/ui`
- **样式**：Tailwind CSS 4
- **地图/GIS**：Mapbox GL、Proj4
- **动画**：Motion
- **部署**：Cloudflare + `@opennextjs/cloudflare`
- **包管理器**：pnpm

## 路由与 SEO

英文 canonical 路由不带语言前缀：

```text
/
/base64
/base64-image
/bbox
/geojson
/json-format
/json-extract
/coordinate-converter
/objectid
/time
/privacy
```

中文 canonical 路由使用 `/zh`：

```text
/zh
/zh/base64
/zh/base64-image
/zh/bbox
/zh/geojson
/zh/json-format
/zh/json-extract
/zh/coordinate-converter
/zh/objectid
/zh/time
/zh/privacy
```

BBox 还有额外的多语言路由：

```text
/de/bbox
/es/bbox
/fr/bbox
```

`/timezone` 是兼容旧链接的重定向，会跳转到 `/time`；本地化的 `/zh/timezone` 也会跳转到对应的时间工具路由。

站点 URL、canonical 和 alternates helper 位于 `src/lib/site.ts`；`TOOL_SLUGS` 是公开工具清单的 source of truth。BBox 专属的多语言路由和 hreflang 配置位于 `src/lib/bbox-i18n.ts`。Sitemap 和 robots 由 `src/app/sitemap.ts` 与 `src/app/robots.ts` 生成，不要新增静态 `public/sitemap.xml` 或 `public/robots.txt`。

## 项目结构

```text
src/
├── app/
│   ├── [lang]/                    # 本地化路由
│   ├── api/                       # GitHub device/token 代理接口
│   ├── base64/                    # 英文 canonical 工具路由
│   ├── base64-image/
│   ├── bbox/
│   ├── coordinate-converter/
│   ├── geojson/
│   ├── json-format/
│   ├── json-extract/
│   ├── objectid/
│   ├── privacy/
│   ├── time/
│   ├── timezone/                  # 兼容旧链接，重定向到 /time
│   ├── layout.tsx                 # 根 metadata、html lang、导航、分析
│   ├── robots.ts                  # 生成 robots.txt
│   └── sitemap.ts                 # 生成 sitemap.xml
├── components/
│   ├── Common/                    # 通用导航、页脚、控件
│   ├── HomePageContent.tsx
│   ├── PrivacyPageContent.tsx
│   └── StructuredData.tsx
├── contexts/
│   └── LanguageContext.tsx
└── lib/
    ├── *-tool.ts                  # 各工具的浏览器逻辑和解析函数
    ├── bbox-i18n.ts               # BBox 文案、SEO、URL
    ├── metadata.ts                # 通用工具 metadata builder
    ├── site.ts                    # 站点 URL、路由 helper、工具 slug
    ├── tool-content.ts            # 首页/工具卡片文案
    └── tool-seo.ts                # 工具 SEO 文案
```

## 快速开始

### 前置要求

- 推荐使用 Node.js 20+。
- 使用 `package.json` 中声明的 pnpm 10.10.0。
- 默认 `pnpm dev` 脚本会用自定义本地 HTTPS hostname 启动 Next.js。你可以把这个 hostname 映射到本机，也可以修改 `package.json` 里的 `-H` 值，换成自己的本地域名。

例如，选择一个本地 hostname 后，可以把它加入 `/etc/hosts`：

```text
127.0.0.1 your-local-hostname.test
```

当前实际 hostname 以 `package.json` 的 `dev` 脚本为准；如果不适合你的环境，可以直接替换。

### 安装依赖

```bash
pnpm install
```

### 环境变量

初始化本地 checkout 时，可以复制本地环境变量模板：

```bash
cp .env.local.example .env.local
```

普通本地开发主要需要关注 BBox 地图使用的 Mapbox public token：

```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your-mapbox-public-token
```

`NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` 是 BBox 交互地图所需的配置。缺少它时，BBox 页面仍会渲染工具面板，但地图区域会显示配置提示，而不是交互式地图：

```text
地图未配置
本地开发请在 .env.local 设置 NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN；Cloudflare 部署请放到 Build variables。详见 README 的 Environment 段落。
```

其他可选的分析、GitHub 预览和站点验证变量记录在 `.env.local.example` 和 `.env.example` 中。

`NEXT_PUBLIC_*` 变量会在 Next.js 构建时写入客户端 bundle。本地 CLI 部署前，请确保需要的 public 变量已经放在 `.env.local`。

如果使用 Cloudflare Workers Git Builds，请在 Cloudflare Dashboard 里添加必需的前端 public 变量：

1. 打开 **Workers & Pages**。
2. 选择 `mofei-dev-tools` Worker。
3. 打开 **Settings > Build**。
4. 在 **Build variables and secrets** 下添加：

```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your-mapbox-public-token
```

不要只依赖运行时的 **Variables and Secrets** 来配置 `NEXT_PUBLIC_*`。运行时变量对已部署 Worker 可用，但对 `next build` 来说太晚了。修改 build variable 后，需要重新部署，让客户端 bundle 带上新值。

### 本地开发

```bash
pnpm dev
```

开发脚本会用自定义 HTTPS host 启动 Next.js。准确 hostname 以 `package.json` 为准，概念上等价于：

```bash
next dev -H your-local-hostname.test --turbopack --experimental-https
```

打开 Next.js 输出的 HTTPS 本地地址即可。

## 验证

```bash
pnpm test
pnpm run build
pnpm run cf:build
```

- `pnpm test` 运行 Node 测试，覆盖工具逻辑、路由约束、metadata/SEO、sitemap 与 robots、本地化路由、BBox 多语言路由、JSON 解析/格式化、Base64 图片解析、坐标转换、ObjectID 生成、GeoJSON 预览 URL 和时区计算。
- `pnpm run build` 运行标准 Next.js build。
- `pnpm run cf:build` 生成 Cloudflare/OpenNext Worker artifact。

## 部署

Cloudflare/OpenNext 相关命令：

```bash
pnpm run cf:build
pnpm run preview
pnpm run deploy
pnpm run cf-typegen
```

`pnpm run build` 适合普通 Next.js production build，但它不是 Cloudflare Worker artifact。`pnpm run cf:build` 会运行 OpenNext，并生成 `.open-next/worker.js` 和 `.open-next/assets`；`wrangler.jsonc` 的 build command 也会执行 `pnpm run cf:build`。

相关部署文件：

- `open-next.config.ts`
- `wrangler.jsonc`
- `next.config.ts`
- `cloudflare-env.d.ts`

`@mofei-dev/ui` 作为 npm 依赖被消费，并由 `next.config.ts` 进行 transpile；它不是这个仓库里的本地 package。

## 添加或修改工具

1. 在 `src/app/<slug>/` 下添加路由和共享 `PageComponent`。
2. 在 `src/app/[lang]/<slug>/` 下添加本地化薄包装页面；需要 metadata 时也添加本地化 layout。本地化页面应设置 `dynamicParams = false`。
3. 新增公开工具时，更新 `src/lib/site.ts` 中的 `TOOL_SLUGS` 和路由 helper。
4. 在 `src/lib/tool-content.ts` 中添加首页和工具卡片文案。
5. 在 `src/lib/tool-seo.ts` 中添加 SEO 文案，并通过 `src/lib/metadata.ts` 生成 route metadata。
6. 工具需要自定义 JSON-LD 时，更新 `src/components/StructuredData.tsx`。
7. 同步更新 `src/app/sitemap.ts` 和 `src/app/robots.ts` 的生成逻辑。
8. 在 `tests/` 下新增或更新测试，覆盖路由存在性、metadata、结构化数据和核心工具行为。
9. 保持本 README 的工具列表、路由列表和项目结构与代码同步。

BBox 的语言配置比较特殊。它支持 `en`、`zh`、`de`、`es`、`fr`，相关文案、SEO 和路由应优先修改 `src/lib/bbox-i18n.ts`。

## 分析与隐私

配置 `NEXT_PUBLIC_GA_ID` 后，Google Analytics 会通过 `src/components/GoogleAnalytics.tsx` 加载。因为这是 `NEXT_PUBLIC_*` 变量，它必须在构建时可用，包括 Cloudflare 的构建环境。同一个组件还导出了共享 event helper，用于各工具的 “Tool Usage” 事件。

工具处理主要在浏览器本地完成。`/api/` 下的接口用于 GitHub device/token 代理，并在 robots 中禁止索引。

隐私页面位于 `/privacy` 和 `/zh/privacy`。

## 贡献

欢迎贡献。修改公开页面时，请保持路由、metadata、sitemap、robots 和共享工具内容同步。

更多流程见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 算法声明

GIS 坐标转换器使用公开且常见的 GIS 转换公式，覆盖 WGS84、GCJ-02、BD-09、UTM 和 Web Mercator。该工具主要面向开发调试和数据准备场景。

## 许可证

本项目开源，使用 [MIT 许可证](LICENSE)。

## 作者

**Mofei**

- 网站：[mofei.life](https://mofei.life)
- GitHub：[@zmofei](https://github.com/zmofei)
