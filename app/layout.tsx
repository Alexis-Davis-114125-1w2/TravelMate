import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../hooks/useAuth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TravelMate - Tu Compañero de Viajes",
  description: "Descubre el mundo con TravelMate. Planifica, organiza y disfruta de tus aventuras con nuestra aplicación de gestión de viajes.",
  keywords: "viajes, turismo, planificación, aventuras, destinos",
  authors: [{ name: "TravelMate Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#667eea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <div className="min-h-screen relative overflow-hidden">
          {/* Background Elements */}
          <div className="fixed inset-0 -z-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 opacity-90"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 opacity-60"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-bl from-pink-400 via-red-500 to-yellow-500 opacity-40"></div>
          </div>
          
          {/* Floating Elements */}
          <div className="fixed top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float"></div>
          <div className="fixed top-40 right-20 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="fixed bottom-20 left-20 w-24 h-24 bg-purple-400/20 rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>
          <div className="fixed bottom-40 right-10 w-28 h-28 bg-pink-400/20 rounded-full blur-2xl animate-float" style={{animationDelay: '1s'}}></div>
          
          <AuthProvider>
            {children}
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
