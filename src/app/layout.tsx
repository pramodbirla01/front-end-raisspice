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
  title: {
    default: "Rai's Spices - Premium Quality Indian Spices & Seasonings",
    template: "%s | Rai's Spices"
  },
  description: "Discover premium quality Indian spices at Rai's Spices. We offer authentic, sustainably sourced spices that bring exceptional flavor and aroma to your cooking. Shop our collection of traditional and modern spice blends.",
  keywords: "Indian spices, premium spices, organic spices, spice blends, cooking spices, authentic Indian seasonings, wholesale spices",
  authors: [{ name: "Rai's Spices" }],
  creator: "Rai's Spices",
  publisher: "Rai's Spices",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ]
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "Rai's Spices - Premium Quality Indian Spices",
    description: "Premium quality Indian spices and seasonings, carefully sourced and processed for authentic flavor and aroma.",
    url: 'https://raisspices.com',
    siteName: "Rai's Spices",
    images: [
      {
        url: '/images/navbar_logo.PNG',
        width: 800,
        height: 600,
        alt: "Rai's Spices Logo",
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Rai's Spices - Premium Quality Indian Spices",
    description: "Premium quality Indian spices and seasonings, carefully sourced and processed for authentic flavor and aroma.",
    images: ['/images/navbar_logo.PNG'],
    creator: '@raisspices',
  },
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

