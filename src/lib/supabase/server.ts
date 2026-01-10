import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Supabase admin client with service role key.
 * Default schema is 'public'.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Get a Supabase client configured for a specific schema.
 *
 * Usage:
 *   const { data } = await getSchemaClient("extracted")
 *     .from("person_profile")
 *     .select("*");
 */
export function getSchemaClient(schema: "core" | "reference" | "raw" | "extracted" | "api") {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema,
    },
  });
}

// Pre-configured clients for each schema
export const coreDb = getSchemaClient("core");
export const referenceDb = getSchemaClient("reference");
export const rawDb = getSchemaClient("raw");
export const extractedDb = getSchemaClient("extracted");
export const apiDb = getSchemaClient("api");

