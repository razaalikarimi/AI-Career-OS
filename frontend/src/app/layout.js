import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata = {
  title: 'AI Career OS – Intelligent Career Development Platform',
  description:
    'The all-in-one AI-powered career development operating system. Resume intelligence, skill gap analysis, job matching, interview simulation, and personalized learning roadmaps.',
  keywords: ['career development', 'AI resume analysis', 'job matching', 'interview prep', 'skill gap'],
  openGraph: {
    title: 'AI Career OS',
    description: 'Your intelligent career development partner',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a1a2e',
                color: '#f1f5f9',
                border: '1px solid rgba(var(--color-primary-rgb), 0.15)',
                borderRadius: '10px',
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: 'var(--color-tertiary)', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: 'var(--color-tertiary)', secondary: '#fff' },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
