import type { Metadata } from "next";
import { Noto_Sans_JP, Noto_Sans_Mono } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans_JP({
  variable: "--font-noto-sans",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const notoMono = Noto_Sans_Mono({
  variable: "--font-noto-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Claude Code チャットインターフェース",
  description: "ChatGPTのようなインターフェースを持つAIチャットアプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${notoSans.variable} ${notoMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
