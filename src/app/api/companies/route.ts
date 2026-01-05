import { NextRequest } from "next/server";
import { extractedDb } from "@/lib/supabase/server";
import {
  PaginationQuerySchema,
  CompanyFirmographicsSearchQuerySchema,
} from "@/lib/schemas";
import {
  paginatedResponse,
  validationErrorResponse,
  serverErrorResponse,
  parseQueryParams,
} from "@/lib/api/response";

/**
 * GET /api/companies
 * Search and list enriched company firmographics.
 */
export async function GET(request: NextRequest) {
  try {
    const params = parseQueryParams(request.nextUrl.searchParams);

    const paginationResult = PaginationQuerySchema.safeParse(params);
    if (!paginationResult.success) {
      return validationErrorResponse(paginationResult.error);
    }

    const searchResult = CompanyFirmographicsSearchQuerySchema.safeParse(params);
    if (!searchResult.success) {
      return validationErrorResponse(searchResult.error);
    }

    const { limit, offset } = paginationResult.data;
    const filters = searchResult.data;

    // Build query
    let query = extractedDb.from("company_firmographics").select("*", { count: "exact" });

    // Apply filters
    if (filters.domain) {
      query = query.ilike("company_domain", `%${filters.domain}%`);
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
    if (filters.size_range) {
      query = query.eq("size_range", filters.size_range);
    }
    if (filters.min_employees !== undefined) {
      query = query.gte("employee_count", filters.min_employees);
    }
    if (filters.max_employees !== undefined) {
      query = query.lte("employee_count", filters.max_employees);
    }
    if (filters.founded_after !== undefined) {
      query = query.gte("founded_year", filters.founded_after);
    }
    if (filters.founded_before !== undefined) {
      query = query.lte("founded_year", filters.founded_before);
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

