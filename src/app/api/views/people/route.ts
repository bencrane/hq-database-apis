import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { z } from "zod";
import {
  paginatedResponse,
  validationErrorResponse,
  serverErrorResponse,
  parseQueryParams,
} from "@/lib/api/response";

const PeopleQuerySchema = z.object({
  // Pagination
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  // Filters
  name: z.string().optional(),
  job_title: z.string().optional(),
  company_name: z.string().optional(),
  company_domain: z.string().optional(),
  industry: z.string().optional(),
  size_range: z.string().optional(),
  location: z.string().optional(),
  country: z.string().optional(),
});

/**
 * GET /api/views/people
 * List people from api.vw_people view with filtering.
 */
export async function GET(request: NextRequest) {
  try {
    const params = parseQueryParams(request.nextUrl.searchParams);
    const result = PeopleQuerySchema.safeParse(params);

    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    const { limit, offset, ...filters } = result.data;

    let query = supabaseAdmin.from("vw_people").select("*", { count: "exact" });

    // Apply filters (partial match with ilike)
    if (filters.name) {
      query = query.ilike("full_name", `%${filters.name}%`);
    }
    if (filters.job_title) {
      query = query.ilike("job_title", `%${filters.job_title}%`);
    }
    if (filters.company_name) {
      query = query.ilike("company_name", `%${filters.company_name}%`);
    }
    if (filters.company_domain) {
      query = query.ilike("company_domain", `%${filters.company_domain}%`);
    }
    if (filters.industry) {
      query = query.ilike("industry", `%${filters.industry}%`);
    }
    if (filters.size_range) {
      query = query.eq("size_range", filters.size_range);
    }
    if (filters.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }
    if (filters.country) {
      query = query.ilike("company_country", `%${filters.country}%`);
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
    return serverErrorResponse(error);
  }
}

