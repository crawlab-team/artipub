import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ArtiPub AI - AI-Powered Article Publishing Platform",
  description: "Leverage the power of AI to automatically publish your articles to multiple platforms with optimized content for maximum engagement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
