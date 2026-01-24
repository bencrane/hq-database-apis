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

// =============================================================================
// HQ Admin Database (separate Supabase project)
// =============================================================================

// Lazy initialization to avoid crashing at build time if env vars are missing
let _hqCoreDb: ReturnType<typeof createClient> | null = null;
let _hqAccountsDb: ReturnType<typeof createClient> | null = null;

/**
 * Get HQ Admin core schema client (lazy initialized).
 * Throws at runtime if env vars are missing.
 */
export function getHqCoreDb() {
  if (!_hqCoreDb) {
    const url = process.env.HQ_ADMIN_SUPABASE_URL;
    const key = process.env.HQ_ADMIN_SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Missing HQ_ADMIN_SUPABASE_URL or HQ_ADMIN_SUPABASE_SERVICE_ROLE_KEY");
    }
    _hqCoreDb = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
      db: { schema: "core" },
    });
  }
  return _hqCoreDb;
}

/**
 * Get HQ Admin accounts schema client (lazy initialized).
 * Throws at runtime if env vars are missing.
 */
export function getHqAccountsDb() {
  if (!_hqAccountsDb) {
    const url = process.env.HQ_ADMIN_SUPABASE_URL;
    const key = process.env.HQ_ADMIN_SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Missing HQ_ADMIN_SUPABASE_URL or HQ_ADMIN_SUPABASE_SERVICE_ROLE_KEY");
    }
    _hqAccountsDb = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
      db: { schema: "accounts" },
    });
  }
  return _hqAccountsDb;
}

