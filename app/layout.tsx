import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Calculadora de Impresión 3D | Fill-3D",
  description:
    "Calcula el precio estimado de tu pieza en 3D. Sube tu archivo STL o 3MF y obtén una cotización al instante. Fill-3D Colombia.",
  keywords: ["impresión 3D", "calculadora", "precio", "STL", "Colombia", "PLA", "PETG"],
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
