import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Evaluador de encaje CV–oferta",
  description:
    "Evalúa el encaje entre un CV y una oferta con una rúbrica fija, carencias reales y un veredicto, con respuesta en streaming.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es"className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
