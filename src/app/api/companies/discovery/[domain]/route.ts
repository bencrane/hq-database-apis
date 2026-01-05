import { NextRequest } from "next/server";
import { extractedDb } from "@/lib/supabase/server";
import {
  jsonResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api/response";

type RouteContext = { params: Promise<{ domain: string }> };

/**
 * GET /api/companies/discovery/{domain}
 * Get a single discovery company record by domain.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { domain } = await context.params;
    const decodedDomain = decodeURIComponent(domain);

    const { data, error } = await extractedDb
      .from("company_discovery")
      .select("*")
      .eq("domain", decodedDomain)
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

