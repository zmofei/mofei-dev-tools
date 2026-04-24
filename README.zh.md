# Mofei 开发工具集

基于 Next.js 15、React 19、TypeScript、Tailwind CSS 和 Cloudflare/OpenNext 构建的在线开发与 GIS 工具集合。

**[中文文档](README.zh.md) | [English](README.md)**

## 在线地址

生产环境：[https://tools.mofei.life](https://tools.mofei.life)

## 工具列表

- **文本 Base64 转换**（`/base64`）：把普通文本编码为 Base64，或把 Base64 解码为可读 UTF-8 文本。
- **BBox 绘制工具**（`/bbox`）：在交互式地图上绘制、预览、解析、分享和复制边界框。
- **GeoJSON 预览**（`/geojson`）：为 GeoJSON 数据生成 geojson.io 预览链接，并支持通过 GitHub device flow 创建较大数据的 Gist 预览。
- **JSON 路径提取**（`/json-extract`）：使用 JSONPath 风格表达式提取 JSON 字段，支持对比和导出结果。
- **GIS 坐标转换**（`/coordinate-converter`）：转换 WGS84、GCJ-02、BD-09、UTM、Web Mercator 等坐标系统。
- **MongoDB ObjectID 生成器**（`/objectid`）：生成 ObjectID、查看时间戳，并支持按自定义时间生成 ID。

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
/bbox
/geojson
/json-extract
/coordinate-converter
/objectid
/privacy
```

中文 canonical 路由使用 `/zh`：

```text
/zh
/zh/base64
/zh/bbox
/zh/geojson
/zh/json-extract
/zh/coordinate-converter
/zh/objectid
/zh/privacy
```

BBox 还有额外的多语言路由：

```text
/de/bbox
/es/bbox
/fr/bbox
```

站点 URL、canonical 和 alternates helper 位于 `src/lib/site.ts`。BBox 专属的多语言路由和 hreflang 配置位于 `src/lib/bbox-i18n.ts`。Sitemap 和 robots 由 `src/app/sitemap.ts` 与 `src/app/robots.ts` 生成，不要新增静态 `public/sitemap.xml` 或 `public/robots.txt`。

## 项目结构

```text
src/
├── app/
│   ├── [lang]/                    # 本地化路由
│   ├── api/                       # GitHub device/token 代理接口
│   ├── base64/                    # 英文 canonical 工具路由
│   ├── bbox/
│   ├── coordinate-converter/
│   ├── geojson/
│   ├── json-extract/
│   ├── objectid/
│   ├── privacy/
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
- 本地 HTTPS 开发时，需要确保 `local.mofei.life` 能解析到本机。

### 安装依赖

```bash
pnpm install
```

### 环境变量

可选的分析和站点验证变量可以放在 `.env.local`：

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
GOOGLE_SITE_VERIFICATION=your-verification-token
```

Cloudflare 构建时，需要把 `NEXT_PUBLIC_GA_ID` 设置为 Build environment variable，这样 `next build` 生成客户端 bundle 时才能读到。

### 本地开发

```bash
pnpm dev
```

开发脚本实际运行：

```bash
next dev -H local.mofei.life --turbopack --experimental-https
```

打开 Next.js 输出的 HTTPS 本地地址即可。

## 验证

```bash
pnpm test
pnpm run build
pnpm run cf:build
```

当前 Node 测试会检查 SEO 配置、canonical URL 规则、本地化路由约束、BBox 多语言路由以及 sitemap/hreflang 行为。

## 部署

Cloudflare/OpenNext 相关命令：

```bash
pnpm run cf:build
pnpm run preview
pnpm run deploy
pnpm run cf-typegen
```

相关部署文件：

- `open-next.config.ts`
- `wrangler.jsonc`
- `next.config.ts`
- `cloudflare-env.d.ts`

## 添加或修改工具

1. 在 `src/app/<slug>/` 下添加路由和共享 `PageComponent`。
2. 在 `src/app/[lang]/<slug>/` 下添加本地化薄包装页面。
3. 新增公开工具时，更新 `src/lib/site.ts` 中的 `TOOL_SLUGS` 和路由 helper。
4. 在 `src/lib/tool-content.ts` 中添加首页和工具卡片文案。
5. 在 `src/lib/tool-seo.ts` 中添加 SEO 文案，并通过 `src/lib/metadata.ts` 生成 route metadata。
6. 同步更新 `src/app/sitemap.ts` 和 `src/app/robots.ts` 的生成逻辑。
7. 在 `tests/` 下新增或更新测试。

BBox 的语言配置比较特殊。它支持 `en`、`zh`、`de`、`es`、`fr`，相关文案、SEO 和路由应优先修改 `src/lib/bbox-i18n.ts`。

## 分析与隐私

配置 `NEXT_PUBLIC_GA_ID` 后，Google Analytics 会通过 `src/components/GoogleAnalytics.tsx` 加载。因为这是 `NEXT_PUBLIC_*` 变量，它必须在构建时可用，包括 Cloudflare 的构建环境。工具处理主要在浏览器本地完成。`/api/` 下的接口用于 GitHub device/token 代理，并在 robots 中禁止索引。

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
