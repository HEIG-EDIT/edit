import type { Metadata, Viewport } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Image from "next/image";

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
        <nav className="bg-gray-900 shadow-md py-2 px-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="w-10 h-10 relative hidden">
            <Image
              src="globe.svg"
              alt="EDIT"
              fill
              className="navLogo object-contain"
            />
          </Link>
          <div className="space-x-4 mt-2 sm:mt-0">
            {/* WIP : en prevision d'autres liens */}
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
