import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import { OnboardingModal } from "@/components/OnboardingModal";
import { CookieBanner } from "@/components/CookieBanner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#1d4ed8" },
  ],
  colorScheme: "dark light",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://coachai.dev"),
  title: {
    default: "CoachAI — Maîtrise la Data & l'IA par la pratique",
    template: "%s | CoachAI",
  },
  description:
    "La plateforme gamifiée pour devenir Data Scientist. Challenges SQL, Machine Learning, Deep Learning avec un système ELO. Formations structurées et certifications.",
  keywords: [
    "data science", "machine learning", "SQL", "deep learning", "NLP", "Python",
    "challenges data", "formation IA", "ELO", "certifications data", "data engineering",
  ],
  authors: [{ name: "CoachAI" }],
  creator: "CoachAI",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://coachai.dev",
    title: "CoachAI — Maîtrise la Data & l'IA par la pratique",
    description: "Challenges SQL, ML, Deep Learning avec système ELO. Formations intégrées.",
    siteName: "CoachAI",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "CoachAI Platform" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CoachAI — La plateforme data/IA gamifiée",
    description: "Challenges SQL, ML, Deep Learning avec ELO. Formations intégrées.",
    images: ["/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "CoachAI",
  url: "https://coachai.dev",
  description: "Plateforme d'apprentissage data science et IA par la pratique et la gamification",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <Providers>
          <div className="min-h-screen flex flex-col dot-grid">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <ChatWidget />
            <OnboardingModal />
            <CookieBanner />
          </div>
        </Providers>
      </body>
    </html>
  );
}
