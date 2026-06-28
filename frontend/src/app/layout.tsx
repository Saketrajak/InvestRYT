import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Investryt AI — Agentic Investment Research Terminal",
  description: "Generate institutional-grade equity research reports instantly using agentic AI.",
};

export const viewport: Viewport = {
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-[100dvh] bg-[#09090b] text-[#f4f4f5] overflow-x-hidden selection:bg-purple-400/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
