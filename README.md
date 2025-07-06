# Mofei Dev Tools

A collection of handy development tools built with Next.js 15, featuring internationalization and modern UI design.

## 🌟 Features

- **🌍 Internationalization**: Full Chinese/English language support with dynamic routing
- **🔤 Base64 Tool**: Encode/decode with history tracking and sharing functionality
- **📱 Responsive Design**: Mobile-first design with beautiful animations
- **⚡ Modern Stack**: Built with Next.js 15, TypeScript, and Tailwind CSS
- **🎨 Beautiful UI**: Gradient effects, smooth animations, and polished design

## 🚀 Live Demo

Visit the tools at your deployed URL to see them in action.

## 📋 Available Tools

### Base64 Encoder/Decoder
- **Encode/Decode**: Convert text to Base64 and vice versa
- **History Tracking**: Keep track of your conversions with timestamps
- **Share Results**: Generate shareable URLs with auto-execution
- **UTF-8 Support**: Full support for Chinese and Unicode characters
- **Local Processing**: All conversions happen in your browser

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
│   ├── [lang]/          # Dynamic language routing
│   │   ├── page.tsx     # Localized homepage
│   │   └── base64/      # Base64 tool pages
│   ├── base64/          # English Base64 tool
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # English homepage
├── components/
│   └── Common/
│       ├── Nav.tsx      # Navigation component
│       └── Foot.tsx     # Footer component
└── contexts/
    └── LanguageContext.tsx # Language management
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

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

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

## 🔧 Development

### Adding New Tools

1. Create a new tool component in `src/components/`
2. Add routes in `src/app/[lang]/` for localized versions
3. Update translations in `src/contexts/LanguageContext.tsx`
4. Add tool metadata to the homepage tool list

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

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Mofei**
- Website: [mofei.life](https://mofei.life)
- GitHub: [@zmofei](https://github.com/zmofei)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Animated with [Framer Motion](https://www.framer.com/motion/)
- Icons from custom SVG designs

---

*More tools coming soon! 🚀*
