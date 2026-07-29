import type { Metadata, Viewport } from "next";
import "./globals.css";
import CloudSyncProvider from "./components/cloud/CloudSyncProvider";
import ServiceWorkerRegister from "./components/cloud/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Ryuka Manager",
  description: "Gestión de presupuestos, producción y stock para Ryuka.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Ryuka Manager",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#810404",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full">
        <CloudSyncProvider>
          <ServiceWorkerRegister />
          {children}
        </CloudSyncProvider>
      </body>
    </html>
  );
}