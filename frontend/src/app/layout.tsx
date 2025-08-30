import type { Metadata, Viewport } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";

const ubuntu = Ubuntu({
  variable: "--font-ubuntu",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EDIT",
  description: "Easy Digital Image Toolkit",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ubuntu.variable}`}>
      <body className="antialiased min-h-screen overflow-x-hidden">
        {children}

        <footer className="bg-gray-700 text-center text-sm p-4 text-gray-600">
          &copy; 2025 EDIT. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
