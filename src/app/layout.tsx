import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "./_components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { RevisionNotificationProvider } from "@/components/revision-notification-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Speedcube Master",
  description:
    "Le site de référence français pour le speedcubing. Timer, algos, stats, méthodes et défis pour tous les puzzles WCA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body
          className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
        >
          <RevisionNotificationProvider>
            <Navbar />
            {children}
            <Toaster />
          </RevisionNotificationProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
