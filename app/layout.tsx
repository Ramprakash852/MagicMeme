import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'MagicMeme — AI Meme Generator',
  description: 'Upload a photo. AI writes the meme. Share the laughs.',
  openGraph: {
    title: 'MagicMeme',
    description: 'AI-powered meme generation',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={inter.variable}>
      <body>
        {children}
        <Toaster
          position='bottom-center'
          toastOptions={{
            style: { background: '#222', color: '#fff', border: '1px solid #333' },
            success: { iconTheme: { primary: '#C8F135', secondary: '#111' } },
          }}
        />
      </body>
    </html>
  );
}
