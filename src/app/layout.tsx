// src/app/layout.tsx
import { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "@/lib/socket-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Mafia - The Ultimate Social Deduction Experience",
  description:
    "Play Mafia with cutting-edge AI personalities. Experience the future of social deduction gaming with premium AI opponents that think, deceive, and strategize like humans.",
  keywords: [
    "mafia",
    "social deduction",
    "ai",
    "game",
    "multiplayer",
    "strategy",
    "detective",
  ],
  authors: [{ name: "AI Mafia Team" }],
  icons: {
    icon: "/detective-logo.png",
    shortcut: "/detective-logo.png",
    apple: "/detective-logo.png",
  },
  openGraph: {
    title: "AI Mafia - The Ultimate Social Deduction Experience",
    description:
      "Play Mafia with cutting-edge AI personalities that think and deceive like humans.",
    url: "https://mafia-ai.xyz",
    siteName: "AI Mafia",
    images: [
      {
        url: "/detective-logo.png",
        width: 512,
        height: 512,
        alt: "AI Mafia Detective Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Mafia - The Ultimate Social Deduction Experience",
    description:
      "Play Mafia with cutting-edge AI personalities that think and deceive like humans.",
    images: ["/detective-logo.png"],
    creator: "@AImafia",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <SocketProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "var(--noir-gray-800)",
                color: "white",
                border: "1px solid var(--detective-blue)",
                borderRadius: "12px",
                boxShadow: "var(--glow-blue)",
              },
              success: {
                iconTheme: {
                  primary: "var(--healer-green)",
                  secondary: "white",
                },
              },
              error: {
                iconTheme: {
                  primary: "var(--mafia-red)",
                  secondary: "white",
                },
              },
            }}
          />
        </SocketProvider>
      </body>
    </html>
  );
}
