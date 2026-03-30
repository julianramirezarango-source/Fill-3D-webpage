import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wiki Fill-3D | Documentación técnica de impresión 3D",
  description:
    "Documentación técnica oficial de Fill-3D Colombia. Guías de calibración, materiales, perfiles de slicer y soporte técnico.",
  keywords: ["impresión 3D", "wiki", "guías", "calibración", "PLA", "filamento", "Colombia", "Fill-3D"],
  icons: {
    icon: "/wiki/logo.svg",
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
