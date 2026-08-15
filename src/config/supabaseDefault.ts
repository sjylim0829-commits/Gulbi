// Gulbi AI Default Supabase Cloud DB Connection Config
// This file serves as the universal fallback configuration across all devices, browsers, and deployments.

export const DEFAULT_SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || '';
export const DEFAULT_SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';
