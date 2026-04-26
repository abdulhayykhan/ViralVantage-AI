import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ViralVantage-AI",
  description: "Content virality analyzer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
