import type { Metadata } from 'next';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Casi Bros Property Development',
  description:
    'Casi Bros Property Development serves Western North Carolina by buying undervalued homes, renovating them into modern living spaces, and selling or renting them.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="site-page">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
