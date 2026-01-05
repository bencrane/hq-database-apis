import { NextRequest } from "next/server";
import { extractedDb } from "@/lib/supabase/server";
import {
  PaginationQuerySchema,
  CompanyDiscoverySearchQuerySchema,
} from "@/lib/schemas";
import {
  paginatedResponse,
  validationErrorResponse,
  serverErrorResponse,
  parseQueryParams,
} from "@/lib/api/response";

/**
 * GET /api/companies/discovery
 * Search and list discovery company data (lightweight, from Clay find-companies).
 */
export async function GET(request: NextRequest) {
  try {
    const params = parseQueryParams(request.nextUrl.searchParams);

    const paginationResult = PaginationQuerySchema.safeParse(params);
    if (!paginationResult.success) {
      return validationErrorResponse(paginationResult.error);
    }

    const searchResult = CompanyDiscoverySearchQuerySchema.safeParse(params);
    if (!searchResult.success) {
      return validationErrorResponse(searchResult.error);
    }

    const { limit, offset } = paginationResult.data;
    const filters = searchResult.data;

    // Build query
    let query = extractedDb.from("company_discovery").select("*", { count: "exact" });

    // Apply filters
    if (filters.domain) {
      query = query.ilike("domain", `%${filters.domain}%`);
    }
    if (filters.name) {
      query = query.ilike("name", `%${filters.name}%`);
    }
    if (filters.industry) {
      query = query.ilike("industry", `%${filters.industry}%`);
    }
    if (filters.country) {
      query = query.ilike("country", `%${filters.country}%`);
    }
    if (filters.size) {
      query = query.eq("size", filters.size);
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

