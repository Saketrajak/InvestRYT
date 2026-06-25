import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Investryt AI — Agentic Investment Research Terminal",
  description: "Generate institutional-grade equity research reports instantly using agentic AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
