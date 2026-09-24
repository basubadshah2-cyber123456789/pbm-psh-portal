import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pakistan Bait-ul-Mal | Pakistan Sweet Home (PSH) Admission Portal",
  description: "Official Pakistan Sweet Home (PSH) Child Admission & Institutional Dossier Portal - Government of Pakistan, Pakistan Bait-ul-Mal.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-emerald-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
