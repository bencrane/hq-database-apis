import { NextRequest } from "next/server";
import { extractedDb } from "@/lib/supabase/server";
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

// Helper to generate initials from full name
function getInitials(fullName: string | null): string {
  if (!fullName) return "";
  return fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * GET /api/views/people
 * List people with company data from extracted schema tables.
 */
export async function GET(request: NextRequest) {
  try {
    const params = parseQueryParams(request.nextUrl.searchParams);
    const result = PeopleQuerySchema.safeParse(params);

    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    const { limit, offset, ...filters } = result.data;

    // Query person_profile from extracted schema
    let query = extractedDb.from("person_profile").select("*", { count: "exact" });

    // Apply filters (partial match with ilike)
    if (filters.name) {
      query = query.ilike("full_name", `%${filters.name}%`);
    }
    if (filters.job_title) {
      query = query.ilike("latest_title", `%${filters.job_title}%`);
    }
    if (filters.company_name) {
      query = query.ilike("latest_company", `%${filters.company_name}%`);
    }
    if (filters.company_domain) {
      query = query.ilike("latest_company_domain", `%${filters.company_domain}%`);
    }
    if (filters.location) {
      query = query.ilike("location_name", `%${filters.location}%`);
    }
    if (filters.country) {
      query = query.ilike("country", `%${filters.country}%`);
    }

    const { data: people, error: peopleError, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (peopleError) throw peopleError;

    if (!people || people.length === 0) {
      return paginatedResponse([], {
        total: 0,
        limit,
        offset,
        hasMore: false,
      });
    }

    // Get unique company domains to fetch company data
    const companyDomains = [...new Set(
      people
        .map((p) => p.latest_company_domain)
        .filter((d): d is string => d !== null && d !== undefined)
    )];

    // Fetch company firmographics for these domains
    let companyMap: Record<string, {
      industry: string | null;
      size_range: string | null;
      employee_count: number | null;
      country: string | null;
    }> = {};

    if (companyDomains.length > 0) {
      let companyQuery = extractedDb
        .from("company_firmographics")
        .select("company_domain, industry, size_range, employee_count, country")
        .in("company_domain", companyDomains);

      // Apply company-level filters
      if (filters.industry) {
        companyQuery = companyQuery.ilike("industry", `%${filters.industry}%`);
      }
      if (filters.size_range) {
        companyQuery = companyQuery.eq("size_range", filters.size_range);
      }
      if (filters.country) {
        companyQuery = companyQuery.ilike("country", `%${filters.country}%`);
      }

      const { data: companies } = await companyQuery;

      if (companies) {
        companyMap = Object.fromEntries(
          companies.map((c) => [c.company_domain, {
            industry: c.industry,
            size_range: c.size_range,
            employee_count: c.employee_count,
            country: c.country,
          }])
        );
      }
    }

    // Transform data to match expected response format
    const transformedData = people
      .map((person) => {
        const company = person.latest_company_domain
          ? companyMap[person.latest_company_domain]
          : null;

        // If we have company filters but this person's company doesn't match, skip
        if (filters.industry || filters.size_range || filters.country) {
          if (!company) return null;
        }

        return {
          id: person.id,
          linkedin_url: person.linkedin_url,
          linkedin_slug: person.linkedin_slug,
          first_name: person.first_name,
          last_name: person.last_name,
          full_name: person.full_name,
          initials: getInitials(person.full_name),
          picture_url: person.picture_url,
          job_title: person.latest_title,
          headline: person.headline,
          company_name: person.latest_company,
          company_domain: person.latest_company_domain,
          company_linkedin_url: person.latest_company_linkedin_url,
          location: person.location_name,
          is_current_role: person.latest_is_current,
          // Company firmographics (joined)
          industry: company?.industry ?? null,
          size_range: company?.size_range ?? null,
          employee_count: company?.employee_count ?? null,
          company_country: company?.country ?? null,
          // Social stats
          connections: person.connections,
          followers: person.num_followers,
          // Timestamps
          source_last_refresh: person.source_last_refresh,
          created_at: person.created_at,
          updated_at: person.updated_at,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);

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

