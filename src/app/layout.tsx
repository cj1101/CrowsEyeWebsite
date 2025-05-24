import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Crow's Eye - AI-Powered Marketing Automation for Visionary Creators",
  description: "Effortlessly organize, create, and publish stunning visual content for Instagram and Facebook. Let AI be your creative partner.",
  keywords: ["AI marketing", "social media automation", "Instagram", "Facebook", "content creation", "creators"],
  authors: [{ name: "Crow's Eye Team" }],
  openGraph: {
    title: "Crow's Eye - AI-Powered Marketing Automation",
    description: "Effortlessly organize, create, and publish stunning visual content for Instagram and Facebook.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
