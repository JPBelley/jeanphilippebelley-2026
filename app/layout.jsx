import './globals.css'
import { Space_Grotesk, DM_Mono } from 'next/font/google'
import Cursor from './components/Cursor'
import Nav from './components/Nav'
import NewsletterSection from './components/NewsletterSection'
import Footer from './components/Footer'

const spaceGrotesk = Space_Grotesk({
  subsets:  ['latin'],
  weight:   ['400', '500', '600', '700'],
  variable: '--font-head',
  display:  'swap',
})

const dmMono = DM_Mono({
  subsets:  ['latin'],
  weight:   ['300', '400'],
  style:    ['normal', 'italic'],
  variable: '--font-mono',
  display:  'swap',
})

export const metadata = {
  title: 'Jean-Philippe Belley',
  description: 'Full Stack Developer Portfolio',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmMono.variable}`}>
      <body>
        <Cursor />
        <Nav />
        {children}
        <NewsletterSection />
        <Footer />
        {/* 100% privacy-first analytics */}
        <script async src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
        <noscript><img src="https://queue.simpleanalyticscdn.com/noscript.gif" alt="" referrerPolicy="no-referrer-when-downgrade" /></noscript>
      </body>
    </html>
  )
}
