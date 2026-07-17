import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/providers/ClientProviders";
import AppShell from "@/components/layout/AppShell";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SCRM Dashboard — Supply Chain Risk Management | Perkebunan Teh",
  description:
    "Dashboard monitoring manajemen risiko rantai pasok (SCRM) untuk industri perkebunan dan manufaktur teh. Visualisasi SCOR, curah hujan, volume produksi, dan ranking agen risiko.",
  keywords: "SCRM, supply chain risk management, perkebunan teh, dashboard, SCOR, ARP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className={`${inter.className} bg-gray-50 antialiased`}>
        <ClientProviders>
          <AppShell>{children}</AppShell>
        </ClientProviders>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </body>
    </html>
  );
}
