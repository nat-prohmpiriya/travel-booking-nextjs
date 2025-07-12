import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AntdRegistry } from '@ant-design/nextjs-registry';
import '@ant-design/v5-patch-for-react-19';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Travel Booking App",
  description: "A travel booking application built with Next.js and Ant Design",
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>{children}</AntdRegistry>

      </body>
    </html>
  );
}
