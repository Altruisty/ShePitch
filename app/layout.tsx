import type { Metadata } from 'next';
import './globals.css';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';

export const metadata: Metadata = {
  title: "ShePitch - National Women's Innovation Pitch Competition",
  description:
    'ShePitch is a national platform created by UGHAM empowering women students to pitch ideas, showcase projects, and connect with industry experts.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
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
