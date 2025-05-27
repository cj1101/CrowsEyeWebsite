# Crow's Eye Website

A modern, responsive website for Crow's Eye software built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Firebase
npm run deploy
```

## 📁 Project Structure

```
├── src/                    # Source code
│   ├── app/               # Next.js app router pages
│   ├── components/        # Reusable React components
│   ├── lib/              # Utility functions and configurations
│   ├── types/            # TypeScript type definitions
│   ├── data/             # Static data and content
│   └── contexts/         # React context providers
├── public/               # Static assets
├── docs/                 # Documentation files
├── scripts/              # Build and deployment scripts
├── config/               # Configuration files
├── tests/                # Test files
└── .github/              # GitHub workflows and templates
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run clean` - Clean build artifacts
- `npm run clean-build` - Clean and build
- `npm run deploy` - Deploy to Firebase Hosting
- `npm run setup` - Run initial project setup
- `npm run setup-firebase` - Setup Firebase configuration

## 🔧 Configuration

Configuration files are organized in the `config/` directory:

- `config/jest.config.js` - Jest testing configuration
- `config/jest.setup.js` - Jest setup file
- `config/eslint.config.mjs` - ESLint configuration
- `config/tailwind.config.ts` - Tailwind CSS configuration
- `config/postcss.config.mjs` - PostCSS configuration

## 📚 Documentation

Detailed documentation is available in the `docs/` directory:

- [Firebase Setup](docs/FIREBASE_SETUP.md)
- [Deployment Guide](docs/DEPLOYMENT_README.md)
- [Authentication](docs/AUTHENTICATION_README.md)
- [Build Process](docs/BUILD_README.md)
- [Translation Guide](docs/TRANSLATION_GUIDE.md)

## 🚀 Deployment

The project is configured for deployment to Firebase Hosting with automatic CI/CD via GitHub Actions.

### Prerequisites

1. Firebase project setup
2. GitHub repository secrets configured
3. Domain configuration (if using custom domain)

### Deploy

```bash
npm run deploy
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch
```

## 🔍 Development

### Environment Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy environment variables: `cp .env.example .env.local`
4. Start development server: `npm run dev`

### Code Style

- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Tailwind CSS for styling

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

Please read the documentation in the `docs/` directory before contributing.
