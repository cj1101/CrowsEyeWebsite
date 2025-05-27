# Crow's Eye Website

A modern, responsive website for Crow's Eye - AI-Powered Marketing Automation for Visionary Creators.

## 🚀 Features

- **Modern Design**: Dark theme with purple gradient branding
- **Responsive Layout**: Optimized for all devices
- **Performance Optimized**: Built with Next.js 15 and TypeScript
- **Beautiful UI**: Custom animations and hover effects
- **SEO Friendly**: Proper meta tags and semantic HTML

## 📋 Pages Included

- **Home Page** (`/`) - Hero section, features overview, philosophy, and CTAs
- **Features Page** (`/features`) - Detailed feature breakdown by tier
- **Pricing Page** (`/pricing`) - Three pricing tiers with FAQ section
- **Contact Page** (`/contact`) - Contact information and contact form
- **Privacy Page** (`/privacy`) - Privacy policy and Meta compliance information

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (React 18+)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons & Lucide React
- **Animations**: Framer Motion
- **UI Components**: Headless UI

## 🏃‍♂️ Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd crows-eye-website
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎨 Customization

### Colors

The website uses a custom purple color palette defined in `tailwind.config.ts`:

- Primary Purple: `#6d28d9`
- Light Purple: `#8b5cf6`
- Dark Purple: `#5b21b6`
- Dark Background: `#0f0f23`
- Dark Light: `#1a1a2e`

### Fonts

Uses Inter font family for clean, modern typography.

### Custom CSS Classes

- `.gradient-text` - Purple gradient text effect
- `.hover-glow` - Glowing hover effect for buttons
- `.feature-card` - Consistent card styling
- `.crow-eye-animation` - Pulsing animation for the logo

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Vercel will automatically deploy your site

### Option 2: Netlify

1. Build the project
```bash
npm run build
```

2. Upload the `out` folder to [Netlify](https://netlify.com)

### Option 3: Traditional Web Hosting

1. Add export configuration to `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
```

2. Build and export:
```bash
npm run build
```

3. Upload the generated `out` folder to your web host

## 🌐 Domain Purchase & Setup

### Where to Buy Domains

**Recommended Domain Registrars:**

1. **Namecheap** (https://www.namecheap.com)
   - Competitive pricing
   - Free privacy protection
   - Good customer support

2. **Google Domains** (https://domains.google.com)
   - Simple interface
   - Integrated with Google services
   - Transparent pricing

3. **Cloudflare Registrar** (https://www.cloudflare.com/products/registrar/)
   - At-cost pricing
   - Built-in security features
   - Fast DNS

### Suggested Domain Names

- `crowseyeapp.com` (Primary recommendation)
- `crowseye.ai`
- `crowseyemarketing.com`
- `getcrowseye.com`

### Domain Setup Steps

1. **Purchase Domain**: Buy your chosen domain from a registrar
2. **Configure DNS**: Point your domain to your hosting provider
3. **SSL Certificate**: Enable HTTPS (usually automatic with modern hosts)
4. **Email Setup**: Configure professional email addresses (e.g., support@crowseyeapp.com)

### Email Configuration

Set up professional email addresses mentioned in the website:
- `support@crowseyeapp.com`
- `sales@crowseyeapp.com`
- `privacy@crowseyeapp.com`

## 📁 Project Structure

```
crows-eye-website/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Home page
│   │   ├── features/page.tsx  # Features page
│   │   ├── pricing/page.tsx   # Pricing page
│   │   ├── contact/page.tsx   # Contact page
│   │   ├── privacy/page.tsx   # Privacy page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   └── components/
│       ├── Navigation.tsx     # Header navigation
│       └── Footer.tsx         # Footer component
├── tailwind.config.ts         # Tailwind configuration
├── next.config.js             # Next.js configuration
└── package.json               # Dependencies
```

## 🔧 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📝 To-Do / Future Enhancements

- [ ] Add contact form backend integration
- [ ] Implement blog functionality (optional)
- [ ] Add more interactive animations
- [ ] Create actual app mockup images
- [ ] Add Meta Review Guide page
- [ ] Implement analytics tracking
- [ ] Add live chat widget
- [ ] Create demo booking system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary to Crow's Eye. All rights reserved.

---

Built with ❤️ for visionary creators who refuse to compromise their artistic vision.
