# Crow's Eye Marketing Suite Website

A modern, responsive website for the Crow's Eye Marketing Suite - an AI-powered social media management platform built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 About Crow's Eye Marketing Suite

Crow's Eye Marketing Suite is your AI-powered command center for intelligent, multi-platform social media marketing. Leveraging Google's Gemini AI for unmatched content generation and media enhancement, it provides creators and businesses with powerful tools to streamline their social media workflow.

### Key Features
- **AI-Powered Content Generation** using Google's Gemini
- **Multi-Platform Management** (Instagram, Facebook, LinkedIn, X)
- **AI-Instructed Media Editing** with natural language commands
- **Video Processing Suite** with highlight reels and thumbnails
- **Comprehensive Analytics** with integrated platform insights
- **Secure Desktop Application** with local processing capabilities

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Authentication**: Firebase Auth with Google OAuth
- **Database**: Cloud Firestore
- **Payments**: Stripe integration with subscription management
- **Deployment**: Firebase Hosting
- **AI Integration**: Google's Gemini API
- **Internationalization**: 10 languages supported

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── account/           # Account management pages
│   │   ├── api/               # API routes (Stripe, downloads, usage)
│   │   ├── auth/              # Authentication pages
│   │   └── ...                # Public pages (home, pricing, features)
│   ├── components/            # Reusable React components
│   ├── contexts/              # React context providers (Auth, etc.)
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions and configurations
│   ├── types/                 # TypeScript type definitions
│   └── data/                  # Static data (pricing tiers, etc.)
├── public/
│   ├── translations/          # i18n translation files
│   └── ...                    # Static assets
├── docs/                      # Documentation
├── scripts/                   # Build and deployment scripts
└── config/                    # Configuration files
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Authentication and Firestore enabled
- Stripe account for payment processing

### Installation

```bash
# Clone the repository
git clone https://github.com/cj1101/CrowsEyeWebsite.git
cd CrowsEyeWebsite

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase and Stripe credentials

# Start development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with:

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

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run Jest tests
- `npm run deploy` - Clean build and deploy to Firebase
- `npm run clean` - Clean build artifacts
- `npm run setup` - Run initial project setup

## 🔧 Key Features Implementation

### Authentication System
- Firebase Authentication with Google OAuth
- Protected routes with middleware
- User profile management
- Session persistence

### Subscription Management
- Stripe integration for payments
- Multiple pricing tiers (Spark, Creator, Pro, Enterprise)
- BYOK (Bring Your Own Key) discounts
- Usage tracking and limits
- Customer portal for billing management

### Account Management
- Comprehensive account settings
- Security settings with 2FA support
- Subscription management
- API key management for BYOK

### Download System
- Secure installer distribution
- Platform detection (Windows, macOS, Linux)
- Web installer with automatic updates
- Download analytics and tracking

### Internationalization
- Support for 10 languages
- Dynamic language switching
- Localized content and UI

## 🚀 Deployment

### Firebase Hosting

```bash
# Build and deploy
npm run deploy

# Deploy hosting only
firebase deploy --only hosting

# Deploy with functions
firebase deploy
```

### Environment Setup

1. **Firebase Project Setup**
   - Enable Authentication (Google provider)
   - Enable Cloud Firestore
   - Configure hosting

2. **Stripe Configuration**
   - Set up products and pricing
   - Configure webhooks
   - Add API keys to environment

3. **Domain Configuration** (Optional)
   - Configure custom domain in Firebase
   - Update environment variables

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint
```

## 📊 Analytics & Monitoring

- Firebase Analytics integration
- Stripe webhook monitoring
- Usage tracking for subscription limits
- Download analytics
- Error tracking and reporting

## 🔒 Security Features

- Firebase Security Rules for Firestore
- Stripe webhook signature verification
- Protected API routes
- Input validation with Zod
- CSRF protection
- Secure download system

## 🌍 Internationalization

Supported languages:
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Portuguese (pt)
- Chinese (zh)
- Japanese (ja)
- Russian (ru)
- Arabic (ar)
- Hindi (hi)

## 📱 Responsive Design

- Mobile-first approach
- Tailwind CSS for styling
- Framer Motion for animations
- Optimized for all screen sizes
- Progressive Web App features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 🆘 Support

For support and questions:
- Email: support@crowseyeapp.com
- Phone: (512) 987-4449
- Documentation: [GitHub Wiki](https://github.com/cj1101/CrowsEyeWebsite/wiki)

## 🔗 Related Repositories

- [Crow's Eye Desktop Application](https://github.com/cj1101/Crow-s-Eye-Marketing-Agent)
- [API Documentation](https://api.crowseye.tech/docs)

---

Built with ❤️ for creators and marketers worldwide.
