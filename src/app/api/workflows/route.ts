import { NextRequest } from "next/server";
import { referenceDb } from "@/lib/supabase/server";
import { WorkflowSearchQuerySchema } from "@/lib/schemas/workflows";
import {
  jsonResponse,
  validationErrorResponse,
  serverErrorResponse,
  parseQueryParams,
} from "@/lib/api/response";

/**
 * GET /api/workflows
 * List enrichment workflow definitions.
 */
export async function GET(request: NextRequest) {
  try {
    const params = parseQueryParams(request.nextUrl.searchParams);

    const searchResult = WorkflowSearchQuerySchema.safeParse(params);
    if (!searchResult.success) {
      return validationErrorResponse(searchResult.error);
    }

    const filters = searchResult.data;

    // Build query
    let query = referenceDb.from("enrichment_workflow_registry").select("*");

    // Apply filters
    if (filters.workflow_slug) {
      query = query.eq("workflow_slug", filters.workflow_slug);
    }
    if (filters.provider) {
      query = query.eq("provider", filters.provider);
    }
    if (filters.platform) {
      query = query.eq("platform", filters.platform);
    }
    if (filters.entity_type) {
      query = query.eq("entity_type", filters.entity_type);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;

    return jsonResponse(data ?? []);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

