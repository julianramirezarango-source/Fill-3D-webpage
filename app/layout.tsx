import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fill-3D | Colombia",
  description: "Fill-3D — Filamentos y herramientas para impresión 3D fabricados en Colombia.",
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
