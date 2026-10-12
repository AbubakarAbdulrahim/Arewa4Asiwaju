import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Keep these as direct references so Next.js inlines the public runtime values
  // into browser bundles. Accessing them through the server env parser leaves
  // the browser client unconfigured in production builds.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase is not configured for this deployment.");
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
