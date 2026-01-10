import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { z } from "zod";
import {
  paginatedResponse,
  validationErrorResponse,
  serverErrorResponse,
  parseQueryParams,
} from "@/lib/api/response";

const CompaniesQuerySchema = z.object({
  // Pagination
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  // Filters
  name: z.string().optional(),
  domain: z.string().optional(),
  industry: z.string().optional(),
  size_range: z.string().optional(),
  country: z.string().optional(),
  min_employees: z.coerce.number().optional(),
  max_employees: z.coerce.number().optional(),
  founded_after: z.coerce.number().optional(),
  founded_before: z.coerce.number().optional(),
});

/**
 * GET /api/views/companies
 * List companies from api.vw_companies view with filtering.
 */
export async function GET(request: NextRequest) {
  try {
    const params = parseQueryParams(request.nextUrl.searchParams);
    const result = CompaniesQuerySchema.safeParse(params);

    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    const { limit, offset, ...filters } = result.data;

    let query = supabaseAdmin.from("vw_companies").select("*", { count: "exact" });

    // Apply filters
    if (filters.name) {
      query = query.ilike("name", `%${filters.name}%`);
    }
    if (filters.domain) {
      query = query.ilike("domain", `%${filters.domain}%`);
    }
    if (filters.industry) {
      query = query.ilike("industry", `%${filters.industry}%`);
    }
    if (filters.size_range) {
      query = query.eq("size_range", filters.size_range);
    }
    if (filters.country) {
      query = query.ilike("country", `%${filters.country}%`);
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
    // Temporary: expose error details for debugging
    const err = error as { message?: string; code?: string; details?: string };
    return Response.json({
      error: {
        code: "INTERNAL_ERROR",
        message: err.message ?? "Unknown error",
        details: err.details ?? null,
        errorCode: err.code ?? null,
      }
    }, { status: 500 });
  }
}

