import { Inter } from "next/font/google";
import { Mohave } from "next/font/google";
import "./globals.css";
import ClientLayoutWrapper from './ClientLayoutWrapper';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const mohave = Mohave({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const metadata = {
  title: "Rai's Spices",
  description: 'Your premium source for authentic Indian spices',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${mohave.className} scroll-smooth`}>
      <body className={`${inter.variable} antialiased`}>
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        <Toaster />
        <Script
          id="razorpay-checkout-js"
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}

