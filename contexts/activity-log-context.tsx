"use client"

import { createContext, useCallback, useContext } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/contexts/auth-context"

type ActivityLogContextType = {
  logAction: (action: string, meta?: Record<string, unknown>) => Promise<void>
}

const ActivityLogContext = createContext<ActivityLogContextType>({
  logAction: async () => {},
})

export function ActivityLogProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  const logAction = useCallback(
    async (action: string, meta?: Record<string, unknown>) => {
      try {
        if (!user) return
        // Optional table: activity_logs(user_id uuid, action text, meta jsonb, created_at timestamptz default now())
        const { error } = await supabase.from("activity_logs").insert({
          user_id: user.id,
          action,
          meta: meta ?? null,
        })
        if (error) {
          // Table may not exist; fail silently in UI
          console.warn("[activity] insert failed", error.message)
        }
      } catch (e) {
        console.warn("[activity] unexpected error", (e as Error).message)
      }
    },
    [user]
  )

  return <ActivityLogContext.Provider value={{ logAction }}>{children}</ActivityLogContext.Provider>
}

export function useActivityLog() {
  return useContext(ActivityLogContext)
}


