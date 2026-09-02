import type { Metadata } from 'next';
import './globals.css';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';

const siteUrl = 'https://www.shepitch.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  // Targets primary queries directly in the title tag
  title: {
    default: "ShePitch | Women's Hackathon & Innovation Pitch Chennai",
    template: "%s | ShePitch",
  },

  
  description:
  "ShePitch is created by UGHAM and powered by ICEBRKR to empower women students to pitch ideas, showcase innovation, and connect with industry experts.",
  
  keywords: [
    // Target event queries
    'ShePitch',
    'She Pitch',
    'women hackathon',
    'chennai hackathon',
    'shepitch chennai hackathon',
    'women hackathon chennai',
    'hackathons in chennai',
    
    // Pitching & innovation keywords
    'pitch in competition',
    'ideapitch',
    'projectpitch',
    'national level innovation pitching competition',
    'women innovation pitch competition',
    'idea pitching competition chennai',
    'project pitch competition',
    
    // Organizations
    'ICEBRKR',
    'powered by ICEBRKR',
    'UGHAM',
    'UGHAM ShePitch',
  ],


  authors: [{ name: 'UGHAM' }, { name: 'ICEBRKR', url: 'https://icebrkr.com' }],
  creator: 'UGHAM & ICEBRKR',
  publisher: 'ShePitch',

  alternates: {
    canonical: '/',
  },

  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },


  manifest: "/site.webmanifest",

  openGraph: {
    title: "ShePitch | Premier Women Hackathon & Innovation Pitch Chennai",

  description:
    "Join ShePitch, Chennai's leading women hackathon and innovation pitch competition. Pitch ideas, build solutions, and connect with tech mentors.",
    url: siteUrl,
    siteName: 'ShePitch',
    locale: 'en_IN',
    type: 'website',

  },

  // Direct instructions for Googlebot
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

  
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased bg-[#fcfbfe] text-gray-900 min-h-screen flex flex-col selection:bg-[#E83E8C]/20 selection:text-[#6C3B8F]">
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </body>
    </html>
  );
}
