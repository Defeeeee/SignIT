import type { Metadata } from "next";
import { Inter, Archivo_Black } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { TRPCProvider } from "@/trpc/Provider";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  weight: "400",
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
    <html lang="es" className={`${inter.variable} ${archivoBlack.variable} h-full antialiased`}>
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
