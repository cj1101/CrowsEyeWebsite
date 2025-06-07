import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import I18nProvider from "@/components/I18nProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
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
      <body className="antialiased" suppressHydrationWarning={true}>
        <ErrorBoundary>
          <AuthProvider>
            <I18nProvider>
              <Navigation />
              <main>{children}</main>
              <Footer />
            </I18nProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
