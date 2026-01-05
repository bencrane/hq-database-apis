import { NextRequest } from "next/server";
import { extractedDb } from "@/lib/supabase/server";
import {
  jsonResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api/response";

type RouteContext = { params: Promise<{ domain: string }> };

/**
 * GET /api/companies/{domain}
 * Get a single enriched company by domain.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { domain } = await context.params;
    const decodedDomain = decodeURIComponent(domain);

    const { data, error } = await extractedDb
      .from("company_firmographics")
      .select("*")
      .eq("company_domain", decodedDomain)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return notFoundResponse("Company");
    }

    return jsonResponse(data);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

