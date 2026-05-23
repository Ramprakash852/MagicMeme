import { createClient } from "@supabase/supabase-js";

// Server-only admin client — uses the service role key.
// Only import this in API routes and Server Components.
// Never import in Client Components or hooks.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);
