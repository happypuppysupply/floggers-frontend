import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth/AuthProvider'
import Navbar from '@/components/Navbar'
import ConditionalFooter from '@/components/ConditionalFooter'
import BecomeSellerFloater from '@/components/BecomeSellerFloater'
import MakerDashboardFloater from '@/components/MakerDashboardFloater'
import AgeGate from '@/components/AgeGate'

export const metadata: Metadata = {
  title: 'Floggers — BDSM Marketplace',
  description: 'The marketplace for independent BDSM artisans and makers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <ConditionalFooter />
          <BecomeSellerFloater />
          <MakerDashboardFloater />
          <AgeGate />
        </AuthProvider>
      </body>
    </html>
  )
}
