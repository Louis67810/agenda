import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { SupabaseCookieOption } from './cookie-types'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: SupabaseCookieOption[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignoré dans les Server Components (lecture seule)
          }
        },
      },
    }
  )
}
