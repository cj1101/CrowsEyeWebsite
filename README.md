# 🦅 Crow's Eye Marketing Suite

**AI-Powered Social Media Management Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688)](https://fastapi.tiangolo.com/)

> **Copyright © 2024 Crow's Eye Marketing Suite. All rights reserved.**

## 🚀 Overview

Crow's Eye Marketing Suite is a comprehensive AI-powered marketing automation platform that helps businesses and content creators streamline their social media presence. With integrated AI capabilities powered by Google's Gemini and OpenAI's GPT models, users can create, schedule, and optimize content across multiple platforms.

### ✨ Key Features

- 🤖 **AI Content Generation** - Create engaging posts with advanced AI models (GPT-4, Gemini Pro)
- 📅 **Smart Scheduling** - Optimize posting times for maximum engagement
- 📊 **Advanced Analytics** - Track performance across all platforms with detailed insights
- 🎨 **Media Processing** - Automatic image and video optimization
- 👥 **Team Collaboration** - Multi-user workspace management
- 🔗 **Platform Integration** - Support for Instagram, Facebook, Twitter, LinkedIn, TikTok, and YouTube
- 🔐 **BYOK Support** - Bring Your Own API Keys for cost optimization
- 💳 **Subscription Management** - Flexible pricing with Stripe integration
- 🌍 **Multi-language Support** - Available in multiple languages
- 🖥️ **Desktop App** - Cross-platform desktop application available

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Features](#features)
- [API Documentation](#api-documentation)
- [Desktop Application](#desktop-application)
- [Deployment](#deployment)
- [Environment Setup](#environment-setup)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## 🛠️ Installation

### Prerequisites

- Node.js 20.x or higher
- Python 3.11+ (for API backend)
- npm or yarn package manager
- Firebase account (for authentication and database)
- Stripe account (for payment processing)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/cj1101/CrowsEyeWebsite.git
   cd CrowsEyeWebsite
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd crow_eye_api
   pip install -r requirements.txt
   cd ..
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

5. **Start the development servers**
   ```bash
   # Terminal 1: Start Next.js frontend
   npm run dev
   
   # Terminal 2: Start FastAPI backend
   cd crow_eye_api
   uvicorn main:app --reload --port 8000
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🚀 Quick Start

### For End Users

1. **Visit the Website**: Go to [https://crowseye.tech](https://crowseye.tech)
2. **Create Account**: Sign up with email or Google authentication
3. **Choose Plan**: Select from Spark (Free), Creator ($29/mo), or Pro ($99/mo)
4. **Connect Platforms**: Link your social media accounts
5. **Start Creating**: Use AI to generate and schedule content

### For Developers

```bash
# Install all dependencies
npm install
cd crow_eye_api && pip install -r requirements.txt && cd ..

# Set up environment
cp .env.example .env.local
# Configure your environment variables

# Start development (run in separate terminals)
npm run dev                    # Frontend on :3000
cd crow_eye_api && uvicorn main:app --reload --port 8000  # API on :8000

# Build for production
npm run build
```

## 🎯 Features

### 🤖 AI-Powered Content Creation
- **Multi-Model Support**: OpenAI GPT-4, Google Gemini Pro, Claude
- **Content Types**: Posts, stories, captions, hashtags, long-form content
- **Brand Voice**: Maintain consistent messaging across platforms
- **A/B Testing**: Optimize content performance with data-driven insights
- **Bulk Generation**: Create multiple posts simultaneously

### 📅 Advanced Scheduling
- **Smart Timing**: AI-optimized posting schedules based on audience activity
- **Bulk Upload**: Schedule multiple posts at once with CSV import
- **Content Calendar**: Visual planning interface with drag-and-drop
- **Auto-Posting**: Seamless platform integration with real-time posting
- **Time Zone Support**: Global scheduling with automatic time zone conversion

### 📊 Analytics & Insights
- **Performance Tracking**: Engagement, reach, impressions, click-through rates
- **Competitor Analysis**: Benchmark against industry leaders
- **ROI Reporting**: Track marketing investment returns with detailed metrics
- **Custom Dashboards**: Personalized analytics views with exportable reports
- **Real-time Monitoring**: Live performance tracking and alerts

### 🔧 Platform Integrations
- **Instagram**: Posts, Stories, Reels, IGTV
- **Facebook**: Pages, Groups, Events, Marketplace
- **Twitter/X**: Tweets, Threads, Spaces
- **LinkedIn**: Posts, Articles, Company Pages, Events
- **TikTok**: Videos, Trends, Live streams
- **YouTube**: Videos, Shorts, Community Posts, Premieres

### 💳 Subscription Management
- **Flexible Plans**: Free tier with premium upgrades
- **Stripe Integration**: Secure payment processing
- **Usage Tracking**: Monitor API usage and limits
- **Team Management**: Multi-user accounts with role-based access

## 📚 API Documentation

### Base URL
- **Development**: `http://localhost:8000/api`
- **Production**: `https://api.crowseye.tech/api`

### Authentication
```typescript
// Login with email/password
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

// Use JWT token for authenticated requests
const token = response.data.access_token;
```

### Content Generation
```typescript
// Generate AI content
const content = await fetch('/api/marketing-tool/posts', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    prompt: "Create a post about sustainable fashion",
    platform: "instagram",
    tone: "professional",
    length: "medium"
  })
});
```

### Media Management
```typescript
// Upload media
const formData = new FormData();
formData.append('file', file);

const media = await fetch('/api/media/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### Analytics
```typescript
// Get analytics overview
const analytics = await fetch('/api/analytics/overview', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Get detailed metrics
const metrics = await fetch('/api/analytics/metrics?period=30d', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## 🖥️ Desktop Application

The Crow's Eye Marketing Suite includes a cross-platform desktop application built with Python and Tkinter.

### Features
- **Offline Capability**: Work without internet connection
- **Local Data Storage**: Secure local database
- **Cross-Platform**: Windows, macOS, and Linux support
- **Sync Integration**: Seamless sync with web platform

### Installation
```bash
# Run the desktop app
python main.py

# Or use the pre-built installer (Windows)
# Download from releases page
```

### Building Desktop App
```bash
# Install build dependencies
pip install pyinstaller

# Build executable
python scripts/build_desktop_apps.py
```

## 🚀 Deployment

### Firebase Hosting (Recommended)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init

# Deploy
npm run build
firebase deploy
```

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker
```bash
# Build and run frontend
docker build -t crowseye-web .
docker run -p 3000:3000 crowseye-web

# Build and run API
cd crow_eye_api
docker build -t crowseye-api .
docker run -p 8000:8000 crowseye-api
```

### Railway/Heroku
```bash
# Deploy API to Railway
railway login
railway init
railway up

# Deploy frontend to Vercel
vercel --prod
```

## 🔧 Environment Setup

### Required Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
API_SECRET_KEY=your_secret_key

# AI API Keys (Optional - for BYOK)
OPENAI_API_KEY=sk-...
GOOGLE_AI_API_KEY=AI...
ANTHROPIC_API_KEY=sk-ant-...

# Social Media API Keys (Optional)
INSTAGRAM_CLIENT_ID=your_client_id
FACEBOOK_APP_ID=your_app_id
TWITTER_API_KEY=your_api_key
LINKEDIN_CLIENT_ID=your_client_id
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style
- Frontend: ESLint + Prettier
- Backend: Black + isort
- Commit messages: Conventional Commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.crowseye.tech](https://docs.crowseye.tech)
- **Email**: support@crowseye.tech
- **Discord**: [Join our community](https://discord.gg/crowseye)
- **GitHub Issues**: [Report bugs](https://github.com/cj1101/CrowsEyeWebsite/issues)

## 🏗️ Architecture

### Frontend (Next.js)
- **Framework**: Next.js 15.3.2 with App Router
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Context + Zustand
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Payments**: Stripe

### Backend (FastAPI)
- **Framework**: FastAPI with async support
- **Database**: SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT tokens
- **AI Integration**: OpenAI, Google AI, Anthropic
- **File Storage**: Local/Cloud storage
- **Task Queue**: Background tasks with FastAPI

### Desktop App (Python)
- **Framework**: Tkinter with custom UI components
- **Database**: SQLite
- **Packaging**: PyInstaller
- **Cross-platform**: Windows, macOS, Linux

---

**Made with ❤️ by the Crow's Eye team**

*Empowering creators and businesses to soar higher in their marketing efforts.*
