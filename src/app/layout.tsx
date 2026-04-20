import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Header } from '@/components/Header';

const interBold = localFont({
  src: '../../public/fonts/OptimusPrincepsSemiBold.ttf',
  variable: '--font-inter',
  display: 'swap',
});

const gameOfSquids = localFont({
  src: '../../public/fonts/OptimusPrincepsSemiBold.ttf',
  variable: '--font-squids',
  display: 'swap',
});

const optimusPrinceps = localFont({
  src: '../../public/fonts/Inter_18pt-Bold.ttf',
  variable: '--font-optimus',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Mail Detective - Every Email Investigated',
  description:
    'Mail Detective investigates every email in your inbox, surfaces the real opportunities, and tells you exactly which ones to act on first.',
  icons: {
    icon: '/logo/logowhite.svg',
    apple: '/logo/logowhite.svg',
  },
};

import { ThemeProvider } from '@/components/theme-provider';
import Providers from '@/components/Providers';
import { ToastProvider } from '@/components/ui/Toast';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${interBold.variable} ${gameOfSquids.variable} ${optimusPrinceps.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            <ToastProvider>
              <div className="flex h-screen flex-col">
                <Header />
                <main className="flex-1 overflow-y-auto pt-12">{children}</main>
              </div>
            </ToastProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
