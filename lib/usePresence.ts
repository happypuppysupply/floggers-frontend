'use client'

import { useEffect, useRef } from 'react'
import { createClient } from './supabase/client'

const HEARTBEAT_MS = 30000 // 30 seconds
const TABLE_NAME = 'profiles'
const COLUMN_NAME = 'last_active'

/**
 * Track the current user's online presence.
 * Updates last_active every 30 seconds while component is mounted.
 */
export function usePresence(userId: string | null | undefined) {
  const supabase = createClient()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!userId) return

    const updateLastActive = async () => {
      await supabase
        .from(TABLE_NAME)
        .update({ [COLUMN_NAME]: new Date().toISOString() })
        .eq('id', userId)
    }

    // Update immediately on mount
    updateLastActive()

    // Heartbeat every 30 seconds
    intervalRef.current = setInterval(updateLastActive, HEARTBEAT_MS)

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [userId, supabase])
}
