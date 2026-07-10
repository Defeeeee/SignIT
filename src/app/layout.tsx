import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { TRPCProvider } from "@/trpc/Provider";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SignIT",
  description: "Red social de interpretaciones en Lengua de Señas Argentina (LSA)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-paper text-obsidian font-sans">
        <SessionProvider>
          <TRPCProvider>
            <NavBar />
            <main className="flex-1">{children}</main>
          </TRPCProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
