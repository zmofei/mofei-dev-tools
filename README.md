# Mofei Dev Tools

A collection of handy development tools built with Next.js 15, featuring internationalization and modern UI design.

**[中文文档](README.zh.md) | [English](README.md)**

## 🌟 Features

- **🌍 Internationalization**: Full Chinese/English language support with dynamic routing
- **🔤 Base64 Tool**: Encode/decode with history tracking and sharing functionality
- **🗺️ GeoJSON Preview**: Generate geojson.io preview links for geographic data visualization
- **📊 JSON Path Extractor**: Extract values from JSON using JSONPath with comparison mode
- **🧭 GIS Coordinate Converter**: Convert between WGS84, GCJ-02, BD-09, UTM, Web Mercator coordinate systems
- **📱 Responsive Design**: Mobile-first design with beautiful animations
- **⚡ Modern Stack**: Built with Next.js 15, TypeScript, and Tailwind CSS
- **🎨 Beautiful UI**: Gradient effects, smooth animations, and polished design

## 🚀 Live Demo

Visit the tools at your deployed URL to see them in action.

## 📋 Available Tools

### 🔤 Base64 Encoder/Decoder
- **Encode/Decode**: Convert text to Base64 and vice versa
- **History Tracking**: Keep track of your conversions with timestamps
- **Share Results**: Generate shareable URLs with auto-execution
- **UTF-8 Support**: Full support for Chinese and Unicode characters
- **Local Processing**: All conversions happen in your browser

### 🗺️ GeoJSON Preview Tool
- **Generate Preview Links**: Create geojson.io preview URLs for GeoJSON data
- **Multiple Storage Methods**: URL method for small files, GitHub Gist for large files
- **GitHub Integration**: OAuth login and personal access token support
- **History Management**: Track and manage your generated preview links
- **Format Validation**: Automatic GeoJSON format validation
- **Large File Support**: Automatic handling of complex geographic data

### 📊 JSON Path Extractor
- **JSONPath Support**: Extract data using standard JSONPath expressions
- **Multi-Column Extraction**: Create multiple extraction columns simultaneously
- **Comparison Mode**: Compare two JSON objects side by side
- **Export Options**: Export results as CSV or Markdown tables
- **Suggested Paths**: Intelligent path suggestions based on JSON structure
- **Array Traversal**: Handle complex nested arrays and objects
- **Real-time Preview**: Live preview of extraction results

### 🧭 GIS Coordinate Converter
- **Multiple Coordinate Systems**: Support for WGS84, GCJ-02, BD-09, UTM, Web Mercator
- **Batch Conversion**: Convert multiple coordinates (one per line)
- **Format Support**: Decimal degrees, degrees-minutes-seconds, UTM zones
- **China-Specific**: Proper handling of Chinese encrypted coordinate systems
- **Share Results**: Generate shareable URLs with coordinate parameters
- **Export Options**: Export conversion results as JSON or CSV
- **Algorithm Transparency**: Uses publicly available conversion algorithms
- **Real-time Conversion**: Instant conversion between all supported systems

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Deployment**: Vercel
- **Icons**: Custom SVG icons

## 🌐 Internationalization

The application supports two languages with intelligent routing:

- **English**: `/` (homepage) and `/en/*` (other pages)
- **Chinese**: `/zh` (homepage) and `/zh/*` (other pages)

## 🏗️ Project Structure

```
src/
├── app/
│   ├── [lang]/                    # Dynamic language routing
│   │   ├── page.tsx               # Localized homepage
│   │   ├── base64/                # Base64 tool pages
│   │   ├── geojson/               # GeoJSON preview tool
│   │   ├── json-extract/          # JSON path extractor
│   │   └── coordinate-converter/  # GIS coordinate converter
│   ├── base64/                    # English Base64 tool
│   ├── geojson/                   # English GeoJSON tool
│   ├── json-extract/              # English JSON extractor
│   ├── coordinate-converter/      # English coordinate converter
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # English homepage
├── components/
│   ├── Common/
│   │   ├── Nav.tsx                # Navigation component
│   │   └── Foot.tsx               # Footer component
│   ├── GoogleAnalytics.tsx        # Analytics integration
│   └── StructuredData.tsx         # SEO structured data
└── contexts/
    └── LanguageContext.tsx        # Language management
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone git@github.com:zmofei/mofei-dev-tools.git
cd mofei-dev-tools
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure environment variables (optional):
```bash
cp .env.example .env.local
# Edit .env.local and add your Google Analytics tracking ID
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Building for Production

```bash
npm run build
npm start
```

## 🎨 Design Features

### Visual Effects
- **Gradient Backgrounds**: Beautiful gradient overlays throughout the UI
- **Dot Pattern**: Animated dot pattern in the footer
- **Smooth Animations**: Framer Motion powered animations
- **Hover Effects**: Interactive hover states for better UX

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Breakpoint System**: Tailwind's responsive breakpoints
- **Touch-Friendly**: Large tap targets and smooth interactions

## 📊 Analytics

The project includes Google Analytics integration for tracking user behavior and tool usage.

### Configuration

1. Get your Google Analytics tracking ID from [Google Analytics](https://analytics.google.com/)
2. Create a `.env.local` file in the project root:
```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```
3. Replace `G-XXXXXXXXXX` with your actual tracking ID

### Tracked Events

The application automatically tracks:
- **Page Views**: All page navigation
- **Tool Usage**: All tool operations (Base64, GeoJSON, JSON extraction, coordinate conversion)
- **User Actions**: Copy, share, export, and other interactions
- **Language Switching**: User language preferences
- **Feature Usage**: GitHub integration, batch operations, format conversions

### Privacy

- All analytics data is anonymized
- No personal information is collected
- Users can disable analytics via browser settings

## 🔧 Development

### Adding New Tools

1. Create a new tool directory in `src/app/` for the main implementation
2. Add localized routes in `src/app/[lang]/` for internationalization
3. Update translations in `src/contexts/LanguageContext.tsx`
4. Add tool metadata to the homepage tool list in `src/app/page.tsx`
5. Update SEO metadata and structured data
6. Add the tool to sitemap.xml and robots.txt

### Adding Translations

Update the translations object in `src/contexts/LanguageContext.tsx`:

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

### Adding Analytics Events

Import and use the event tracking function:

```typescript
import { event } from '@/components/GoogleAnalytics';

// Track custom events
event('action_name', 'Category', 'Label', value);
```

## 💬 User Feedback & Tool Requests

We highly value your feedback and suggestions! Here's how you can help us improve:

### 🎯 How to Provide Feedback

- **🐛 Found a bug?** → [Report an issue](https://github.com/zmofei/mofei-dev-tools/issues/new?template=bug_report.yml)
- **✨ Want a new feature?** → [Request a feature](https://github.com/zmofei/mofei-dev-tools/issues/new?template=feature_request.yml)  
- **💡 Have an idea for a new tool?** → [Start a discussion](https://github.com/zmofei/mofei-dev-tools/discussions/new?category=ideas)
- **🤔 Need help using a tool?** → [Ask in Q&A](https://github.com/zmofei/mofei-dev-tools/discussions/new?category=q-a)
- **💬 Want to share feedback?** → [General discussion](https://github.com/zmofei/mofei-dev-tools/discussions/new?category=general)

### 🚀 Tool Request Process

1. **Share your idea** in [Discussions](https://github.com/zmofei/mofei-dev-tools/discussions)
2. **Community discussion** and feedback
3. **Feasibility assessment** by maintainers
4. **Development prioritization** based on demand and complexity
5. **Implementation** and testing
6. **Release** and user notification

### 📊 What We're Looking For

- **Developer tools** that save time and effort
- **Data conversion** and processing utilities
- **Text manipulation** and formatting tools
- **Design helpers** and calculators
- **Productivity boosters** for common tasks

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

📖 **Read our [Contributing Guide](CONTRIBUTING.md) for detailed instructions.**

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Mofei**
- Website: [mofei.life](https://mofei.life)
- GitHub: [@zmofei](https://github.com/zmofei)

## 📝 Algorithm Declaration

The coordinate conversion algorithms used in the GIS Coordinate Converter are based on publicly available resources from the internet and open source GIS community:

- **WGS84 to GCJ-02 conversion**: Based on standard algorithms published by China's Bureau of Surveying and Mapping
- **GCJ-02 to BD-09 conversion**: Based on open source community algorithms  
- **UTM projection conversion**: Based on standard map projection mathematical models
- **Web Mercator conversion**: Based on EPSG:3857 standard

These algorithms are industry-standard mathematical models widely used in various GIS applications.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Animated with [Framer Motion](https://www.framer.com/motion/)
- Icons from custom SVG designs
- Coordinate conversion algorithms from open source GIS community

---

*More tools coming soon! 🚀*
