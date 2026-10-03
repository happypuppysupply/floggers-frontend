'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

export default function ConditionalNavbar() {
  const pathname = usePathname()

  // Hide main Navbar on dashboard routes — dashboard layout has its own mobile header
  if (pathname?.startsWith('/dashboard')) {
    return null
  }

  return <Navbar />
}
