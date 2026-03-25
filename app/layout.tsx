import type { Metadata } from 'next'
import { Cinzel, Montserrat } from 'next/font/google'
import './globals.css'
import StoreProvider from '@/components/providers/StoreProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import ScrollToTop from '@/components/ui/ScrollToTop'

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  weight: ['400', '600', '700']
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700']
})

export const metadata: Metadata = {
  title: 'IMPULSE - Master the Art of Trading',
  description: 'Empowering traders worldwide with professional tools, expert education, and cutting-edge strategies.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cinzel.variable} ${montserrat.variable}`}>
      <body className={montserrat.className}>
        <StoreProvider>
          <ThemeProvider>
            {children}
            <ScrollToTop />
          </ThemeProvider>
        </StoreProvider>
      </body>
    </html>
  )
}
