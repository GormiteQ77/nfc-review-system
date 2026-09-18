import type { Metadata } from "next";
import { bebasNeue, cormorant, fraunces, workSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Panel NFC",
  description: "Zbieraj opinie klientów i zarządzaj wizytówkami NFC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      className={`${fraunces.variable} ${workSans.variable} ${cormorant.variable} ${bebasNeue.variable}`}
    >
      <body className="bg-slate-50 text-slate-900 antialiased" style={{ fontFamily: 'var(--font-work-sans)' }}>
        {children}
      </body>
    </html>
  );
}
