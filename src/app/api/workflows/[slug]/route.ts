import { NextRequest } from "next/server";
import { referenceDb } from "@/lib/supabase/server";
import {
  jsonResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api/response";

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * GET /api/workflows/{slug}
 * Get a single workflow by slug.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    const { data, error } = await referenceDb
      .from("enrichment_workflow_registry")
      .select("*")
      .eq("workflow_slug", slug)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return notFoundResponse("Workflow");
    }

    return jsonResponse(data);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

