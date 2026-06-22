// lib/supabase/client.ts
// Singleton browser Supabase client — use this in all "use client" components.
// Uses @supabase/supabase-js directly (localStorage-backed session) so the JWT
// is reliably included in every request.

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

let _client: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  if (!_client) {
    _client = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _client
}
