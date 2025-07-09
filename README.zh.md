# Mofei 开发工具集

基于 Next.js 15 构建的实用开发工具集合，具有国际化支持和现代化 UI 设计。

**[中文文档](README.zh.md) | [English](README.md)**

## 🌟 特性

- **🌍 国际化支持**: 完整的中英文语言支持，动态路由切换
- **🔤 Base64 工具**: 编码解码，支持历史记录和分享功能
- **🗺️ GeoJSON 预览**: 生成 geojson.io 预览链接，用于地理数据可视化
- **📊 JSON 路径提取**: 使用 JSONPath 表达式提取数据，支持对比模式
- **🧭 GIS 坐标转换**: 支持 WGS84、GCJ-02、BD-09、UTM、Web墨卡托坐标系统转换
- **📱 响应式设计**: 移动端优先设计，流畅动画效果
- **⚡ 现代技术栈**: 基于 Next.js 15、TypeScript 和 Tailwind CSS 构建
- **🎨 精美界面**: 渐变效果、流畅动画和精致设计

## 🚀 在线演示

访问部署的网址查看工具实际效果。

## 📋 可用工具

### 🔤 Base64 编码解码器
- **编码解码**: 文本与 Base64 相互转换
- **历史记录**: 保存转换历史，支持时间戳
- **分享结果**: 生成可分享的 URL，支持自动执行
- **UTF-8 支持**: 完整支持中文和 Unicode 字符
- **本地处理**: 所有转换在浏览器本地完成

### 🗺️ GeoJSON 预览工具
- **生成预览链接**: 为 GeoJSON 数据创建 geojson.io 预览 URL
- **多种存储方式**: 小文件使用 URL 方式，大文件使用 GitHub Gist
- **GitHub 集成**: 支持 OAuth 登录和个人访问令牌
- **历史管理**: 跟踪和管理生成的预览链接
- **格式验证**: 自动 GeoJSON 格式验证
- **大文件支持**: 自动处理复杂的地理数据

### 📊 JSON 路径提取器
- **JSONPath 支持**: 使用标准 JSONPath 表达式提取数据
- **多列提取**: 同时创建多个提取列
- **对比模式**: 并排对比两个 JSON 对象
- **导出选项**: 导出结果为 CSV 或 Markdown 表格
- **智能建议**: 基于 JSON 结构的智能路径建议
- **数组遍历**: 处理复杂的嵌套数组和对象
- **实时预览**: 实时显示提取结果

### 🧭 GIS 坐标转换器
- **多坐标系统**: 支持 WGS84、GCJ-02、BD-09、UTM、Web墨卡托
- **批量转换**: 转换多个坐标（每行一个）
- **格式支持**: 十进制度、度分秒、UTM 分带
- **中国特色**: 正确处理中国加密坐标系统
- **分享结果**: 生成带坐标参数的可分享 URL
- **导出选项**: 导出转换结果为 JSON 或 CSV
- **算法透明**: 使用公开可用的转换算法
- **实时转换**: 所有支持系统间的即时转换

## 🛠️ 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **部署**: Vercel
- **图标**: 自定义 SVG 图标

## 🌐 国际化

应用支持两种语言的智能路由：

- **英文**: `/`（首页）和 `/en/*`（其他页面）
- **中文**: `/zh`（首页）和 `/zh/*`（其他页面）

## 🏗️ 项目结构

```
src/
├── app/
│   ├── [lang]/                    # 动态语言路由
│   │   ├── page.tsx               # 本地化首页
│   │   ├── base64/                # Base64 工具页面
│   │   ├── geojson/               # GeoJSON 预览工具
│   │   ├── json-extract/          # JSON 路径提取器
│   │   └── coordinate-converter/  # GIS 坐标转换器
│   ├── base64/                    # 英文 Base64 工具
│   ├── geojson/                   # 英文 GeoJSON 工具
│   ├── json-extract/              # 英文 JSON 提取器
│   ├── coordinate-converter/      # 英文坐标转换器
│   ├── globals.css                # 全局样式
│   ├── layout.tsx                 # 根布局
│   └── page.tsx                   # 英文首页
├── components/
│   ├── Common/
│   │   ├── Nav.tsx                # 导航组件
│   │   └── Foot.tsx               # 页脚组件
│   ├── GoogleAnalytics.tsx        # 分析集成
│   └── StructuredData.tsx         # SEO 结构化数据
└── contexts/
    └── LanguageContext.tsx        # 语言管理
```

## 🚀 快速开始

### 前置要求

- Node.js 18+ 
- npm 或 yarn

### 安装

1. 克隆仓库：
```bash
git clone git@github.com:zmofei/mofei-dev-tools.git
cd mofei-dev-tools
```

2. 安装依赖：
```bash
npm install
# 或者
yarn install
```

3. 配置环境变量（可选）：
```bash
cp .env.example .env.local
# 编辑 .env.local 并添加你的 Google Analytics 跟踪 ID
```

4. 运行开发服务器：
```bash
npm run dev
# 或者
yarn dev
```

5. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)。

## 📦 生产构建

```bash
npm run build
npm start
```

## 🎨 设计特性

### 视觉效果
- **渐变背景**: 整个 UI 中美丽的渐变叠加
- **点状图案**: 页脚中的动画点状图案
- **流畅动画**: Framer Motion 驱动的动画
- **悬停效果**: 交互式悬停状态提升用户体验

### 响应式设计
- **移动端优先**: 为移动设备优化
- **断点系统**: Tailwind 的响应式断点
- **触摸友好**: 大触摸目标和流畅交互

## 📊 分析

项目集成了 Google Analytics 用于跟踪用户行为和工具使用情况。

### 配置

1. 从 [Google Analytics](https://analytics.google.com/) 获取你的跟踪 ID
2. 在项目根目录创建 `.env.local` 文件：
```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```
3. 将 `G-XXXXXXXXXX` 替换为你的实际跟踪 ID

### 跟踪事件

应用自动跟踪：
- **页面浏览**: 所有页面导航
- **工具使用**: 所有工具操作（Base64、GeoJSON、JSON 提取、坐标转换）
- **用户操作**: 复制、分享、导出和其他交互
- **语言切换**: 用户语言偏好
- **功能使用**: GitHub 集成、批量操作、格式转换

### 隐私

- 所有分析数据都是匿名的
- 不收集个人信息
- 用户可以通过浏览器设置禁用分析

## 🔧 开发

### 添加新工具

1. 在 `src/app/` 中创建新工具目录用于主要实现
2. 在 `src/app/[lang]/` 中添加本地化路由用于国际化
3. 在 `src/contexts/LanguageContext.tsx` 中更新翻译
4. 在 `src/app/page.tsx` 中添加工具元数据到首页工具列表
5. 更新 SEO 元数据和结构化数据
6. 将工具添加到 sitemap.xml 和 robots.txt

### 添加翻译

在 `src/contexts/LanguageContext.tsx` 中更新翻译对象：

```typescript
const translations = {
  zh: {
    'your.key': '中文翻译',
    // ...
  },
  en: {
    'your.key': 'English Translation',
    // ...
  }
};
```

### 添加分析事件

导入并使用事件跟踪函数：

```typescript
import { event } from '@/components/GoogleAnalytics';

// 跟踪自定义事件
event('action_name', 'Category', 'Label', value);
```

## 💬 用户反馈与工具需求

我们非常重视您的反馈和建议！以下是您可以帮助我们改进的方式：

### 🎯 如何提供反馈

- **🐛 发现了问题？** → [报告问题](https://github.com/zmofei/mofei-dev-tools/issues/new?template=bug_report.yml)
- **✨ 想要新功能？** → [请求功能](https://github.com/zmofei/mofei-dev-tools/issues/new?template=feature_request.yml)  
- **💡 有新工具想法？** → [开始讨论](https://github.com/zmofei/mofei-dev-tools/discussions/new?category=ideas)
- **🤔 需要使用帮助？** → [在问答区提问](https://github.com/zmofei/mofei-dev-tools/discussions/new?category=q-a)
- **💬 想分享反馈？** → [一般讨论](https://github.com/zmofei/mofei-dev-tools/discussions/new?category=general)

### 🚀 工具需求流程

1. **分享您的想法** 在 [讨论区](https://github.com/zmofei/mofei-dev-tools/discussions)
2. **社区讨论** 和反馈
3. **可行性评估** 由维护者进行
4. **开发优先级** 基于需求和复杂性
5. **实现** 和测试
6. **发布** 和用户通知

### 📊 我们正在寻找的工具类型

- **开发工具** 节省时间和精力
- **数据转换** 和处理工具
- **文本处理** 和格式化工具
- **设计助手** 和计算器
- **生产力工具** 处理常见任务

## 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

1. Fork 仓库
2. 创建你的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个 Pull Request

📖 **阅读我们的[贡献指南](CONTRIBUTING.md)获取详细说明。**

## 📝 算法声明

GIS 坐标转换器中使用的坐标转换算法基于来自互联网和开源 GIS 社区的公开可用资源：

- **WGS84 到 GCJ-02 转换**: 基于中国国家测绘局发布的标准算法
- **GCJ-02 到 BD-09 转换**: 基于开源社区算法  
- **UTM 投影转换**: 基于标准地图投影数学模型
- **Web 墨卡托转换**: 基于 EPSG:3857 标准

这些算法是在各种 GIS 应用中广泛使用的行业标准数学模型。

## 📝 许可证

本项目是开源的，使用 [MIT 许可证](LICENSE)。

## 👨‍💻 作者

**Mofei**
- 网站: [mofei.life](https://mofei.life)
- GitHub: [@zmofei](https://github.com/zmofei)

## 🙏 致谢

- 使用 [Next.js](https://nextjs.org/) 构建
- 使用 [Tailwind CSS](https://tailwindcss.com/) 样式设计
- 使用 [Framer Motion](https://www.framer.com/motion/) 动画
- 自定义 SVG 设计图标
- 来自开源 GIS 社区的坐标转换算法

---

*更多工具即将推出！🚀*