import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.fill-3d.com"),
  title: "Wiki Fill3D — Documentación técnica de impresión 3D",
  description:
    "Guías de impresión 3D en español: materiales, calibración, perfiles de slicer validados y solución de problemas. Por Fill3D, fabricantes de filamento en Itagüí, Colombia.",
  keywords: ["impresión 3D", "wiki", "guías", "calibración", "PLA", "filamento", "Colombia", "Fill3D"],
  alternates: {
    canonical: "https://www.fill-3d.com/wiki/",
  },
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
