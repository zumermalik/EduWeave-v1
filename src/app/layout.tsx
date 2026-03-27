import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Load the Inter font and set it up as a CSS variable
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "eduweave | visualize anything that you read",
  description: "Transform complex text into dynamic, interactive learning modules.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Apply the font variable and our default text color from tailwind.config.ts */}
      <body className={`${inter.variable} font-sans antialiased text-edu-olive`}>
        {children}
      </body>
    </html>
  );
}