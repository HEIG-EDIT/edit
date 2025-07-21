import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link"
import Image from "next/image"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen overflow-x-hidden`}
      >
      <nav className="bg-gray-700 shadow-md py-2 px-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="w-10 h-10 relative">
              <Image
                  src="globe.svg"
                  alt="EDIT"
                  fill
                  className="navLogo object-contain"
              />
          </Link>
          <div className="space-x-4 mt-2 sm:mt-0">

          </div>
      </nav>
        {children}
      <footer className="bg-gray-700 text-center text-sm p-4 text-gray-600">
          &copy; 2025 EDIT. All rights reserved.
      </footer>
      </body>
    </html>
  );
}
