import { NextRequest } from "next/server";
import { extractedDb } from "@/lib/supabase/server";
import { PaginationQuerySchema, ByPastCompanyQuerySchema } from "@/lib/schemas";
import {
  paginatedResponse,
  validationErrorResponse,
  badRequestResponse,
  serverErrorResponse,
  parseQueryParams,
} from "@/lib/api/response";

/**
 * GET /api/people/by-past-company
 * Find people who previously worked at a specific company.
 */
export async function GET(request: NextRequest) {
  try {
    const params = parseQueryParams(request.nextUrl.searchParams);

    const paginationResult = PaginationQuerySchema.safeParse(params);
    if (!paginationResult.success) {
      return validationErrorResponse(paginationResult.error);
    }

    const searchResult = ByPastCompanyQuerySchema.safeParse(params);
    if (!searchResult.success) {
      return validationErrorResponse(searchResult.error);
    }

    const { limit, offset } = paginationResult.data;
    const { company_domain, company_linkedin_url, company_name } = searchResult.data;

    // Require at least one identifier
    if (!company_domain && !company_linkedin_url && !company_name) {
      return badRequestResponse(
        "At least one of company_domain, company_linkedin_url, or company_name is required"
      );
    }

    // Build experience query to find past employees
    let expQuery = extractedDb
      .from("person_experience")
      .select("*")
      .eq("is_current", false); // Only past employment

    // Apply filters in priority order
    if (company_domain) {
      expQuery = expQuery.eq("company_domain", company_domain);
    } else if (company_linkedin_url) {
      expQuery = expQuery.eq("company_linkedin_url", company_linkedin_url);
    } else if (company_name) {
      expQuery = expQuery.ilike("company", `%${company_name}%`);
    }

    const { data: experiences, error: expError } = await expQuery;

    if (expError) throw expError;

    if (!experiences || experiences.length === 0) {
      return paginatedResponse([], {
        total: 0,
        limit,
        offset,
        hasMore: false,
      });
    }

    // Get unique linkedin_urls from experiences
    const uniqueUrls = [...new Set(experiences.map((e) => e.linkedin_url))];

    // Fetch profiles for these people
    const { data: profiles, error: profileError } = await extractedDb
      .from("person_profile")
      .select("*")
      .in("linkedin_url", uniqueUrls);

    if (profileError) throw profileError;

    // Build response: profile + matching past experience
    const results = (profiles ?? []).map((profile) => {
      const pastExperience = experiences.filter(
        (e) => e.linkedin_url === profile.linkedin_url
      );
      return {
        linkedin_url: profile.linkedin_url,
        linkedin_slug: profile.linkedin_slug,
        full_name: profile.full_name,
        headline: profile.headline,
        current_company: profile.latest_company,
        current_title: profile.latest_title,
        picture_url: profile.picture_url,
        past_experience_at_company: pastExperience,
      };
    });

    // Manual pagination
    const total = results.length;
    const paged = results.slice(offset, offset + limit);

    return paginatedResponse(paged, {
      total,
      limit,
      offset,
      hasMore: total > offset + limit,
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

