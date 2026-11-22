import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vórtex QR - Genera tus códigos, sin límites",
  description: "Vórtex QR, de Vortex Company: genera códigos QR de URLs, texto, WiFi, vCard, email, teléfono o SMS con colores, tamaño y corrección de error personalizables. Descarga en PNG o SVG. Gratis, sin anuncios y 100% local.",
  keywords: ["Vórtex QR","generador QR","código QR gratis","QR WiFi","QR vCard","QR sin anuncios"],
  authors: [{ name: "Vortex Company" }],
  icons: {
    icon:
      "data:image/svg+xml," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#161616"/><rect x="8" y="8" width="12" height="12" rx="2" fill="none" stroke="#fbbf24" stroke-width="3"/><rect x="28" y="8" width="12" height="12" rx="2" fill="none" stroke="#fbbf24" stroke-width="3"/><rect x="8" y="28" width="12" height="12" rx="2" fill="none" stroke="#fbbf24" stroke-width="3"/><rect x="28" y="28" width="5" height="5" fill="#fbbf24"/><rect x="35" y="35" width="5" height="5" fill="#fbbf24"/><rect x="35" y="28" width="5" height="5" fill="#fbbf24"/><rect x="28" y="35" width="5" height="5" fill="#fbbf24"/></svg>`
      ),
  },
  openGraph: {
    title: "Vórtex QR - Genera tus códigos, sin límites",
    description: "Vórtex QR, de Vortex Company: genera códigos QR de URLs, texto, WiFi, vCard, email, teléfono o SMS con colores, tamaño y corrección de error personalizables. Descarga en PNG o SVG. Gratis, sin anuncios y 100% local.",
    siteName: "Vórtex QR - Genera tus códigos, sin límites",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f0f10",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className="antialiased bg-[#0f0f10] text-[#ececf1]">{children}</body>
    </html>
  );
}
