import type { Metadata } from "next";
import Script from "next/script";
import { JetBrains_Mono, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Coin Assist",
  description: "Reading-first crypto analysis frontend for AI Coin Assist.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" data-theme="light" suppressHydrationWarning>
      <body className={`${notoSansKr.variable} ${jetBrainsMono.variable}`}>
        <Script id="theme-init" strategy="beforeInteractive">
          {`(function(){try{var stored=localStorage.getItem("aica-theme");var system=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=(stored==="dark"||stored==="light")?stored:system;}catch(e){}})();`}
        </Script>
        {children}
      </body>
    </html>
  );
}
