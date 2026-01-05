import { NextRequest } from "next/server";
import { extractedDb } from "@/lib/supabase/server";
import {
  jsonResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api/response";

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * GET /api/people/discovery/{slug}
 * Get a single discovery person record by LinkedIn slug.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    const { data, error } = await extractedDb
      .from("person_discovery")
      .select("*")
      .ilike("linkedin_url", `%/in/${slug}%`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return notFoundResponse("Person");
    }

    return jsonResponse(data);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

