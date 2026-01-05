import { NextRequest } from "next/server";
import { extractedDb } from "@/lib/supabase/server";
import { PaginationQuerySchema, PersonDiscoverySearchQuerySchema } from "@/lib/schemas";
import {
  paginatedResponse,
  validationErrorResponse,
  serverErrorResponse,
  parseQueryParams,
} from "@/lib/api/response";
import { extractLinkedInSlug } from "@/lib/utils/linkedin";

/**
 * GET /api/people/discovery
 * Search and list discovery person data (lightweight, from Clay find-people).
 */
export async function GET(request: NextRequest) {
  try {
    const params = parseQueryParams(request.nextUrl.searchParams);

    const paginationResult = PaginationQuerySchema.safeParse(params);
    if (!paginationResult.success) {
      return validationErrorResponse(paginationResult.error);
    }

    const searchResult = PersonDiscoverySearchQuerySchema.safeParse(params);
    if (!searchResult.success) {
      return validationErrorResponse(searchResult.error);
    }

    const { limit, offset } = paginationResult.data;
    const filters = searchResult.data;

    // Build query
    let query = extractedDb.from("person_discovery").select("*", { count: "exact" });

    // Apply filters
    if (filters.linkedin_url) {
      const slug = extractLinkedInSlug(filters.linkedin_url);
      if (slug) {
        query = query.ilike("linkedin_url", `%${slug}%`);
      }
    }
    if (filters.name) {
      query = query.ilike("full_name", `%${filters.name}%`);
    }
    if (filters.title) {
      query = query.ilike("latest_title", `%${filters.title}%`);
    }
    if (filters.company) {
      query = query.ilike("latest_company", `%${filters.company}%`);
    }
    if (filters.company_domain) {
      query = query.ilike("company_domain", `%${filters.company_domain}%`);
    }
    if (filters.location) {
      query = query.ilike("location_name", `%${filters.location}%`);
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

