import { NextRequest } from "next/server";
import { rawDb } from "@/lib/supabase/server";
import { PaginationQuerySchema } from "@/lib/schemas";
import {
  paginatedResponse,
  validationErrorResponse,
  serverErrorResponse,
  parseQueryParams,
} from "@/lib/api/response";

/**
 * GET /api/salesnav-scrapes
 * List all Sales Navigator scrape records from raw.salesnav_scrapes.
 */
export async function GET(request: NextRequest) {
  try {
    const params = parseQueryParams(request.nextUrl.searchParams);

    const paginationResult = PaginationQuerySchema.safeParse(params);
    if (!paginationResult.success) {
      return validationErrorResponse(paginationResult.error);
    }

    const { limit, offset } = paginationResult.data;

    const { data, error, count } = await rawDb
      .from("salesnav_scrapes")
      .select("*", { count: "exact" })
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

