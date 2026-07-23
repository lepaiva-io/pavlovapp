import { createClient } from '@supabase/supabase-js'

// Clave "publishable" de cliente: es pública por diseño y está protegida por RLS.
// (Misma clave que ya estaba en producción.)
export const SUPABASE_URL = 'https://uzeetjebuqucjkndwkzb.supabase.co'
const SUPABASE_KEY = 'sb_publishable_kMWpmTOqW4KrYcFMmuG_0w_ipdg3yHR'

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY)
