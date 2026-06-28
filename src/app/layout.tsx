import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alerta Sísmica Venezuela — Información en Vivo",
  description:
    "Alertas en vivo, guías de supervivencia y reportes ciudadanos ante la emergencia sísmica en Venezuela.",
  keywords: ["sismo", "Venezuela", "terremoto", "emergencia", "Caracas", "La Guaira"],
  robots: "index, follow",
  openGraph: {
    title: "Alerta Sísmica Venezuela",
    description: "Información en vivo para familias afectadas por la emergencia sísmica.",
    type: "website",
    locale: "es_VE",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d1117",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
