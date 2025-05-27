# Crow's Eye Marketing Suite

Your AI-Powered Command Center for intelligent, multi-platform social media marketing.

## 🚀 Features

- **AI-Powered Content Generation**: Leveraging Google's Gemini 1.5 Flash for unmatched content creation
- **Multi-Platform Management**: Manage Instagram, Facebook, and soon LinkedIn & X from one dashboard
- **AI-Instructed Media Editing**: Edit images and process videos using natural language commands
- **Streamlined Productivity Tools**: Presets, context files, and comprehensive media library
- **Multi-Language Support**: Available in English, French, German, Spanish, Portuguese, Russian, Chinese, Japanese, Hindi, and Arabic

## 🌐 Live Demo

Try the web demo at: [Your Website URL]

## 📱 Desktop Application

Download the full desktop application for complete functionality:
- Advanced AI features
- Video editing capabilities
- Social media posting
- Offline functionality

## 🛠️ Development

This is a Next.js application built with:
- **Framework**: Next.js 15 with Turbopack
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Internationalization**: Custom i18n implementation
- **AI Integration**: Google Gemini 1.5 Flash

### Getting Started

1. Clone the repository:
```bash
git clone [your-repo-url]
cd crows-eye-website
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Project Structure

```
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── demo/           # Demo page
│   │   ├── download/       # Download page
│   │   ├── features/       # Features page
│   │   ├── pricing/        # Pricing page
│   │   └── ...
│   ├── components/         # React components
│   │   ├── Navigation.tsx
│   │   ├── LanguageSelector.tsx
│   │   ├── I18nProvider.tsx
│   │   └── ...
│   └── lib/               # Utility functions
├── public/
│   └── translations/      # Translation files
├── build.py              # Desktop app build script
├── build_enhanced.py     # Enhanced build script with GitHub Actions
└── ...
```

## 🌍 Internationalization

The application supports multiple languages with complete translations for:
- Navigation and UI elements
- Demo functionality
- Download instructions
- Feature descriptions

Translation files are located in `public/translations/`.

## 🏗️ Building Desktop Application

The project includes automated build scripts for creating desktop applications:

### Basic Build
```bash
python build.py
```

### Enhanced Build with GitHub Actions
```bash
python build_enhanced.py
```

This creates cross-platform installers for Windows, macOS, and Linux.

## 📋 Requirements

- Node.js 18+ 
- npm or yarn
- Python 3.8+ (for desktop app building)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check our comprehensive guides
- **Community**: Join our community for help and tips
- **Issues**: Report bugs or request features via GitHub Issues

## 🔮 Roadmap

- [ ] LinkedIn integration
- [ ] X (Twitter) integration
- [ ] Advanced video editing features
- [ ] Team collaboration tools
- [ ] Analytics dashboard
- [ ] Mobile app

---

Built with ❤️ using Next.js, TypeScript, and Google's Gemini AI
