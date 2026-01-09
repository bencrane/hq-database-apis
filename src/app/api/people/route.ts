import { NextRequest } from "next/server";
import { coreDb } from "@/lib/supabase/server";
import {
  PaginationQuerySchema,
  CorePersonSearchQuerySchema,
} from "@/lib/schemas";
import {
  paginatedResponse,
  validationErrorResponse,
  serverErrorResponse,
  parseQueryParams,
} from "@/lib/api/response";

/**
 * GET /api/people
 * Search and list canonical person records from core.people.
 */
export async function GET(request: NextRequest) {
  try {
    const params = parseQueryParams(request.nextUrl.searchParams);

    const paginationResult = PaginationQuerySchema.safeParse(params);
    if (!paginationResult.success) {
      return validationErrorResponse(paginationResult.error);
    }

    const searchResult = CorePersonSearchQuerySchema.safeParse(params);
    if (!searchResult.success) {
      return validationErrorResponse(searchResult.error);
    }

    const { limit, offset } = paginationResult.data;
    const filters = searchResult.data;

    // Build query
    let query = coreDb.from("people").select("*", { count: "exact" });

    // Apply filters
    if (filters.linkedin_url) {
      query = query.eq("linkedin_url", filters.linkedin_url);
    }
    if (filters.linkedin_slug) {
      query = query.eq("linkedin_slug", filters.linkedin_slug);
    }
    if (filters.full_name) {
      query = query.ilike("full_name", `%${filters.full_name}%`);
    }

    // Execute with pagination
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return paginatedResponse(data ?? [], {
      total: count ?? 0,
      limit,
      offset,
      hasMore: (count ?? 0) > offset + limit,
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
