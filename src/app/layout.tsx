import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Script from "next/script";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'production' ? 'https://crowseye.netlify.app' : 'http://localhost:3000'),
  title: "Crow's Eye - AI-Powered Marketing Automation for Visionary Creators",
  description: "Effortlessly organize, create, and publish stunning visual content for Instagram and Facebook. Let AI be your creative partner.",
  keywords: ["AI marketing", "social media automation", "Instagram", "Facebook", "content creation", "creators"],
  authors: [{ name: "Crow's Eye Team" }],
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: "Crow's Eye - AI-Powered Marketing Automation",
    description: "Effortlessly organize, create, and publish stunning visual content for Instagram and Facebook.",
    type: "website",
    images: ['/icon.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/crows_eye_logo_transparent.png"
          as="image"
          type="image/png"
        />
        {/* Inject public env vars for client-side runtime access */}
        <Script
          id="env"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.__ENV__ = {
              NEXT_PUBLIC_FIREBASE_API_KEY: "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}",
              NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}",
              NEXT_PUBLIC_FIREBASE_PROJECT_ID: "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}",
              NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}",
              NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}",
              NEXT_PUBLIC_FIREBASE_APP_ID: "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}"
            };`,
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning={true}>
        <ErrorBoundary>
          <AuthProvider>
            <Navigation />
            <main>{children}</main>
            <Footer />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
