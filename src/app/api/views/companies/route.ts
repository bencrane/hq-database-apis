import { NextRequest } from "next/server";
import { extractedDb } from "@/lib/supabase/server";
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
 * List companies from extracted.company_firmographics with filtering.
 */
export async function GET(request: NextRequest) {
  try {
    const params = parseQueryParams(request.nextUrl.searchParams);
    const result = CompaniesQuerySchema.safeParse(params);

    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    const { limit, offset, ...filters } = result.data;

    // Query company_firmographics from extracted schema
    let query = extractedDb.from("company_firmographics").select("*", { count: "exact" });

    // Apply filters
    if (filters.name) {
      query = query.ilike("name", `%${filters.name}%`);
    }
    if (filters.domain) {
      query = query.ilike("company_domain", `%${filters.domain}%`);
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

    // Transform data to match expected response format
    const transformedData = (data ?? []).map((company) => ({
      id: company.id,
      domain: company.company_domain,
      linkedin_url: company.linkedin_url,
      linkedin_slug: company.linkedin_slug,
      name: company.name,
      description: company.description,
      website: company.website,
      logo_url: company.logo_url,
      company_type: company.company_type,
      industry: company.industry,
      founded_year: company.founded_year,
      size_range: company.size_range,
      employee_count: company.employee_count,
      country: company.country,
      locality: company.locality,
      primary_location: company.primary_location,
      linkedin_followers: company.follower_count,
      specialties: company.specialties,
      source_last_refresh: company.source_last_refresh,
      created_at: company.created_at,
    }));

    return paginatedResponse(transformedData, {
      total: count ?? 0,
      limit,
      offset,
      hasMore: (count ?? 0) > offset + limit,
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

