import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { GoogleTagManager } from '@next/third-parties/google';
import Script from "next/script";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Global MBA Excellence | Transform Your Career",
  description: "Join an industry-integrated online MBA in Finance and accounting by Yenepoya University.",
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <GoogleTagManager gtmId="GTM-5XLDC59F" />
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHE_SITE_KEY}`}
        strategy="afterInteractive"
      />
      <body
        className={`${poppins.variable} ${inter.variable} antialiased`}
      >
        <noscript>
          <iframe 
            src="https://www.googletagmanager.com/ns.html?id=GTM-5XLDC59F"
            height="0" 
            width="0" 
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        {children}
      </body>
    </html>
  );
}
