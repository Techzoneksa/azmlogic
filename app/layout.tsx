import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "عزم للتشغيل اللوجستي",
  description: "منصة تشغيل لوجستي عربية لإدارة الطلبات والطرود والمندوبين والربط المستقبلي",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/assets/icon.svg",
    apple: "/assets/icon.svg"
  }
};

export const viewport: Viewport = {
  themeColor: "#203860",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
