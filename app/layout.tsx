import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MagicMeme — AI-native creative studio",
  description:
    "Turn any photo into a polished, shareable meme with AI captions and a premium editor.",
  keywords: [
    "meme generator",
    "AI memes",
    "meme creator",
    "caption generator",
    "creative studio",
  ],
  openGraph: {
    title: "MagicMeme — AI-native creative studio",
    description:
      "Turn any photo into a polished, shareable meme with AI captions and a premium editor.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MagicMeme AI Meme Creator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MagicMeme — AI-native creative studio",
    description:
      "Turn any photo into a polished, shareable meme with AI captions and a premium editor.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-[var(--background)] text-[var(--text-primary)] antialiased">
        {children}
        <Toaster
          position="bottom-center"
          gutter={16}
          containerStyle={{ bottom: 32 }}
          toastOptions={{
            duration: 3500,
            style: {
              background: "rgba(24,24,24,0.96)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              fontSize: "14px",
              fontWeight: "500",
              padding: "12px 16px",
              boxShadow:
                "0 18px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02)",
              backdropFilter: "blur(18px) saturate(160%)",
              WebkitBackdropFilter: "blur(18px) saturate(160%)",
            },
            success: {
              style: {
                background: "var(--surface-card)",
                border: "1px solid rgba(52,211,153,0.2)",
                boxShadow:
                  "0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(52,211,153,0.2)",
              },
              iconTheme: {
                primary: "#34D399",
                secondary: "var(--surface-card)",
              },
            },
            error: {
              style: {
                background: "var(--surface-card)",
                border: "1px solid rgba(248,113,113,0.2)",
                boxShadow:
                  "0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(248,113,113,0.2)",
              },
              iconTheme: {
                primary: "#F87171",
                secondary: "var(--surface-card)",
              },
            },
            loading: {
              style: {
                background: "var(--surface-card)",
                border: "1px solid rgba(200,241,53,0.2)",
                boxShadow:
                  "0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(200,241,53,0.2)",
              },
              iconTheme: {
                primary: "var(--lime)",
                secondary: "var(--surface-card)",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
