import { NextRequest } from "next/server";
import { coreDb, referenceDb, extractedDb } from "@/lib/supabase/server";
import {
  jsonResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import type { CompanyCriteria, PersonCriteria, Lead } from "@/lib/schemas/leads";

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * GET /api/leads/{slug}
 * Get leads matching a company's ICP criteria.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const decodedSlug = decodeURIComponent(slug).toLowerCase();

    // 1. Look up ICP by slug
    const { data: icp, error: icpError } = await referenceDb
      .from("company_icp")
      .select("slug, domain, company_criteria, person_criteria")
      .eq("slug", decodedSlug)
      .maybeSingle();

    if (icpError) throw icpError;

    if (!icp) {
      return notFoundResponse("ICP for slug");
    }

    const icpDomain = icp.domain;
    const companyCriteria = icp.company_criteria as CompanyCriteria | null;
    const personCriteria = icp.person_criteria as PersonCriteria | null;

    // 2. Find companies matching company_criteria
    const matchingCompanyDomains = await findMatchingCompanies(companyCriteria);

    if (matchingCompanyDomains.length === 0) {
      return jsonResponse({
        slug: decodedSlug,
        domain: icpDomain,
        company_name: null,
        icp: {
          company_criteria: companyCriteria,
          person_criteria: personCriteria,
        },
        leads: [],
        total_leads: 0,
      });
    }

    // 3. Find people at those companies matching person_criteria
    const leads = await findMatchingPeople(matchingCompanyDomains, personCriteria);

    // 4. Get the company name for the ICP owner from core.companies
    const { data: icpCompany } = await coreDb
      .from("companies")
      .select("name")
      .eq("domain", icpDomain)
      .maybeSingle();

    return jsonResponse({
      slug: decodedSlug,
      domain: icpDomain,
      company_name: icpCompany?.name ?? null,
      icp: {
        company_criteria: companyCriteria,
        person_criteria: personCriteria,
      },
      leads,
      total_leads: leads.length,
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

/**
 * Find companies matching ICP company criteria.
 */
async function findMatchingCompanies(
  criteria: CompanyCriteria | null
): Promise<string[]> {
  if (!criteria) {
    // No criteria means match all companies - get a sample
    const { data } = await extractedDb
      .from("company_firmographics")
      .select("company_domain")
      .limit(200);
    return data?.map((c) => c.company_domain).filter(Boolean) as string[] ?? [];
  }

  // Build query for company_firmographics
  let query = extractedDb
    .from("company_firmographics")
    .select("company_domain, name, industry, size_range, employee_count, country");

  // Apply employee count filters
  if (criteria.employee_count_min !== undefined) {
    query = query.gte("employee_count", criteria.employee_count_min);
  }
  if (criteria.employee_count_max !== undefined) {
    query = query.lte("employee_count", criteria.employee_count_max);
  }

  const { data: companies, error } = await query.limit(500);

  if (error || !companies) {
    console.error("Error fetching companies:", error);
    return [];
  }

  // Filter in-memory for complex criteria
  const filtered = companies.filter((company) => {
    // Industry matching (case-insensitive partial match)
    if (criteria.industries && criteria.industries.length > 0) {
      const companyIndustry = (company.industry ?? "").toLowerCase();
      const industryMatch = criteria.industries.some((ind) =>
        companyIndustry.includes(ind.toLowerCase())
      );
      if (!industryMatch) return false;
    }

    // Size bucket matching
    if (criteria.size_buckets && criteria.size_buckets.length > 0) {
      const companySizeRange = company.size_range ?? "";
      if (!criteria.size_buckets.includes(companySizeRange)) return false;
    }

    // Country matching (case-insensitive)
    if (criteria.countries && criteria.countries.length > 0) {
      const companyCountry = (company.country ?? "").toLowerCase();
      const countryMatch = criteria.countries.some(
        (c) => companyCountry.includes(c.toLowerCase()) || c.toLowerCase().includes(companyCountry)
      );
      if (!countryMatch) return false;
    }

    return true;
  });

  return filtered.map((c) => c.company_domain).filter(Boolean) as string[];
}

/**
 * Find people at matching companies who fit person criteria.
 */
async function findMatchingPeople(
  companyDomains: string[],
  criteria: PersonCriteria | null
): Promise<Lead[]> {
  if (companyDomains.length === 0) return [];

  // Query people at these companies
  const { data: people, error } = await extractedDb
    .from("person_profile")
    .select(`
      linkedin_url,
      linkedin_slug,
      full_name,
      latest_title,
      latest_company,
      latest_company_domain
    `)
    .in("latest_company_domain", companyDomains)
    .not("latest_title", "is", null)
    .order("full_name", { ascending: true })
    .limit(200);

  if (error || !people) {
    console.error("Error fetching people:", error);
    return [];
  }

  // Get company details for enrichment
  const companyDetailsMap = await getCompanyDetails(companyDomains);

  // Filter by person criteria
  const filtered = people.filter((person) => {
    if (!criteria) return true;

    const title = (person.latest_title ?? "").toLowerCase();

    // title_contains_any: at least ONE must match (OR logic)
    if (criteria.title_contains_any && criteria.title_contains_any.length > 0) {
      const anyMatch = criteria.title_contains_any.some((term) =>
        title.includes(term.toLowerCase())
      );
      if (!anyMatch) return false;
    }

    // title_contains_all: at least ONE must match (OR logic for functional area)
    if (criteria.title_contains_all && criteria.title_contains_all.length > 0) {
      const allMatch = criteria.title_contains_all.some((term) =>
        title.includes(term.toLowerCase())
      );
      if (!allMatch) return false;
    }

    return true;
  });

  // Map to Lead format
  const leads: Lead[] = filtered.slice(0, 50).map((person) => {
    const companyInfo = companyDetailsMap.get(person.latest_company_domain ?? "");
    return {
      linkedin_url: person.linkedin_url,
      linkedin_slug: person.linkedin_slug,
      full_name: person.full_name,
      title: person.latest_title,
      company_name: person.latest_company ?? companyInfo?.name ?? null,
      company_domain: person.latest_company_domain,
      company_industry: companyInfo?.industry ?? null,
      company_size: companyInfo?.size_range ?? null,
      is_worked_at_customer: false,
      worked_at_customer_company: null,
    };
  });

  return leads;
}

/**
 * Get company details for a list of domains.
 */
async function getCompanyDetails(
  domains: string[]
): Promise<Map<string, { name: string | null; industry: string | null; size_range: string | null }>> {
  const map = new Map<string, { name: string | null; industry: string | null; size_range: string | null }>();

  if (domains.length === 0) return map;

  const { data } = await extractedDb
    .from("company_firmographics")
    .select("company_domain, name, industry, size_range")
    .in("company_domain", domains);

  if (data) {
    for (const company of data) {
      map.set(company.company_domain, {
        name: company.name,
        industry: company.industry,
        size_range: company.size_range,
      });
    }
  }

  return map;
}

