import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calculadora de Impresión 3D | Fill-3D",
  description:
    "Calcula el precio de impresión 3D con precisión: material, electricidad, tiempo, margen y más. Soporta STL y 3MF. Fill-3D Colombia.",
  keywords: ["calculadora impresión 3D", "precio impresión 3D", "STL", "3MF", "PLA", "filamento", "Colombia", "Fill-3D"],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 font-sans">{children}</body>
    </html>
  );
}
