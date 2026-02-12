import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BackgroundBlobs } from "@/components/ui/BackgroundBlobs";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mio Portfolio",
  description: "Portfolio creato con Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BackgroundBlobs />
        <div className="relative z-10">
           {children}
        </div>

      </body>
    </html>
  );
}