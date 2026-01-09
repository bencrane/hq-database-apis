export interface QueryParam {
  name: string;
  type: string;
  required: boolean;
  description: string;
}

export interface PathParam {
  name: string;
  type: string;
  description: string;
  example: string;
}

export interface ResponseField {
  name: string;
  type: string;
  description: string;
}

export interface EndpointDoc {
  method: string;
  path: string;
  slug: string;
  summary: string;
  description: string;
  pathParams: PathParam[];
  queryParams: QueryParam[];
  exampleRequest: string;
  responseType: "object" | "list" | "paginated";
  responseFields: ResponseField[];
  intendedUse: string;
}

export const endpointDocs: EndpointDoc[] = [
  // ============================================================
  // Companies
  // ============================================================
  {
    method: "GET",
    path: "/api/companies",
    slug: "api-companies",
    summary: "List canonical companies",
    description:
      "Returns paginated canonical company records from the core.companies table. These are deduplicated, stable entity records representing companies known to the system. Use this for entity resolution or to check if a company exists.",
    pathParams: [],
    queryParams: [
      { name: "limit", type: "integer", required: false, description: "Results per page (1-100, default 20)" },
      { name: "offset", type: "integer", required: false, description: "Number of results to skip (default 0)" },
      { name: "domain", type: "string", required: false, description: "Filter by company domain (partial match)" },
      { name: "name", type: "string", required: false, description: "Filter by company name (partial match)" },
    ],
    exampleRequest: "GET /api/companies?domain=stripe.com",
    responseType: "paginated",
    responseFields: [
      { name: "data", type: "CoreCompany[]", description: "Array of canonical company records" },
      { name: "pagination.total", type: "integer", description: "Total matching records" },
      { name: "pagination.limit", type: "integer", description: "Page size" },
      { name: "pagination.offset", type: "integer", description: "Current offset" },
      { name: "pagination.hasMore", type: "boolean", description: "Whether more pages exist" },
    ],
    intendedUse:
      "Use this endpoint to query the canonical company registry. These records establish that a company exists in the system with a stable ID. For enriched firmographic data, use /api/companies/firmo instead.",
  },
  {
    method: "GET",
    path: "/api/companies/firmo",
    slug: "api-companies-firmo",
    summary: "Search enriched companies",
    description:
      "Returns paginated company firmographics data from enriched sources. Use this endpoint to find companies matching specific criteria like industry, size, or location. Results include detailed firmographic data suitable for account-level analysis.",
    pathParams: [],
    queryParams: [
      { name: "limit", type: "integer", required: false, description: "Results per page (1-100, default 20)" },
      { name: "offset", type: "integer", required: false, description: "Number of results to skip (default 0)" },
      { name: "domain", type: "string", required: false, description: "Filter by company domain (partial match)" },
      { name: "name", type: "string", required: false, description: "Filter by company name (partial match)" },
      { name: "industry", type: "string", required: false, description: "Filter by industry (exact match)" },
      { name: "country", type: "string", required: false, description: "Filter by country (exact match)" },
      { name: "size_range", type: "string", required: false, description: "Filter by size range (e.g., '201-500')" },
      { name: "min_employees", type: "integer", required: false, description: "Minimum employee count" },
      { name: "max_employees", type: "integer", required: false, description: "Maximum employee count" },
      { name: "founded_after", type: "integer", required: false, description: "Filter companies founded after this year" },
      { name: "founded_before", type: "integer", required: false, description: "Filter companies founded before this year" },
    ],
    exampleRequest: "GET /api/companies/firmo?industry=Technology&min_employees=100&limit=10",
    responseType: "paginated",
    responseFields: [
      { name: "data", type: "CompanyFirmographics[]", description: "Array of company records" },
      { name: "pagination.total", type: "integer", description: "Total matching records" },
      { name: "pagination.limit", type: "integer", description: "Page size" },
      { name: "pagination.offset", type: "integer", description: "Current offset" },
      { name: "pagination.hasMore", type: "boolean", description: "Whether more pages exist" },
    ],
    intendedUse:
      "Use this endpoint when building account lists or searching for companies that match target criteria. Common workflows include filtering by industry and size to identify potential accounts, then using the domain to fetch detailed data via the single-company endpoint.",
  },
  {
    method: "GET",
    path: "/api/companies/firmo/{domain}",
    slug: "api-companies-firmo-domain",
    summary: "Get enriched company by domain",
    description:
      "Returns a single enriched company record by its domain. This provides complete firmographic data for a known company including employee count, industry, founding year, and location details.",
    pathParams: [
      { name: "domain", type: "string", description: "Company website domain", example: "acme.com" },
    ],
    queryParams: [],
    exampleRequest: "GET /api/companies/firmo/stripe.com",
    responseType: "object",
    responseFields: [
      { name: "id", type: "uuid", description: "Internal record ID" },
      { name: "company_domain", type: "string", description: "Primary domain" },
      { name: "name", type: "string", description: "Company name" },
      { name: "industry", type: "string", description: "Primary industry" },
      { name: "employee_count", type: "integer", description: "Employee headcount" },
      { name: "size_range", type: "string", description: "Size bucket (e.g., '201-500')" },
      { name: "founded_year", type: "integer", description: "Year founded" },
      { name: "country", type: "string", description: "Headquarters country" },
      { name: "linkedin_url", type: "string", description: "LinkedIn company page" },
    ],
    intendedUse:
      "Use this endpoint when you have a specific company domain and need its firmographic details. Common use cases include enriching CRM records, validating account data, or pulling details for a specific account page.",
  },
  {
    method: "GET",
    path: "/api/companies/discovery",
    slug: "api-companies-discovery",
    summary: "Search discovery companies",
    description:
      "Returns paginated lightweight company records from discovery sources. Discovery data contains basic company information suitable for initial filtering before enrichment. Use this for high-volume searches where full firmographics aren't needed.",
    pathParams: [],
    queryParams: [
      { name: "limit", type: "integer", required: false, description: "Results per page (1-100, default 20)" },
      { name: "offset", type: "integer", required: false, description: "Number of results to skip (default 0)" },
      { name: "domain", type: "string", required: false, description: "Filter by domain (partial match)" },
      { name: "name", type: "string", required: false, description: "Filter by company name (partial match)" },
      { name: "industry", type: "string", required: false, description: "Filter by industry (exact match)" },
      { name: "country", type: "string", required: false, description: "Filter by country (exact match)" },
      { name: "size", type: "string", required: false, description: "Filter by size bucket" },
    ],
    exampleRequest: "GET /api/companies/discovery?country=United%20States&size=51-200",
    responseType: "paginated",
    responseFields: [
      { name: "data", type: "CompanyDiscovery[]", description: "Array of discovery company records" },
      { name: "pagination.total", type: "integer", description: "Total matching records" },
      { name: "pagination.hasMore", type: "boolean", description: "Whether more pages exist" },
    ],
    intendedUse:
      "Use this endpoint for initial company discovery when building prospect lists. Discovery data is lighter weight than enriched firmographics, making it suitable for broad searches. Filter down to candidates here, then enrich specific domains via /api/companies/firmo/{domain}.",
  },
  {
    method: "GET",
    path: "/api/companies/discovery/{domain}",
    slug: "api-companies-discovery-domain",
    summary: "Get discovery company by domain",
    description:
      "Returns a single discovery company record by domain. Provides basic company data from discovery sources without full enrichment.",
    pathParams: [
      { name: "domain", type: "string", description: "Company website domain", example: "acme.com" },
    ],
    queryParams: [],
    exampleRequest: "GET /api/companies/discovery/notion.so",
    responseType: "object",
    responseFields: [
      { name: "id", type: "uuid", description: "Internal record ID" },
      { name: "domain", type: "string", description: "Company domain" },
      { name: "name", type: "string", description: "Company name" },
      { name: "industry", type: "string", description: "Primary industry" },
      { name: "size", type: "string", description: "Size bucket" },
      { name: "country", type: "string", description: "Country" },
      { name: "annual_revenue", type: "string", description: "Revenue range" },
    ],
    intendedUse:
      "Use this endpoint to check if a company exists in discovery data before triggering enrichment workflows. Useful for validation or when lightweight data is sufficient.",
  },
  // ============================================================
  // People
  // ============================================================
  {
    method: "GET",
    path: "/api/people",
    slug: "api-people",
    summary: "List canonical people",
    description:
      "Returns paginated canonical person records from the core.people table. These are deduplicated, stable entity records representing people known to the system. Use this for entity resolution or to check if a person exists.",
    pathParams: [],
    queryParams: [
      { name: "limit", type: "integer", required: false, description: "Results per page (1-100, default 20)" },
      { name: "offset", type: "integer", required: false, description: "Number of results to skip (default 0)" },
      { name: "linkedin_url", type: "string", required: false, description: "Filter by LinkedIn URL (exact match)" },
      { name: "linkedin_slug", type: "string", required: false, description: "Filter by LinkedIn slug (exact match)" },
      { name: "full_name", type: "string", required: false, description: "Filter by full name (partial match)" },
    ],
    exampleRequest: "GET /api/people?linkedin_slug=satyanadella",
    responseType: "paginated",
    responseFields: [
      { name: "data", type: "CorePerson[]", description: "Array of canonical person records" },
      { name: "pagination.total", type: "integer", description: "Total matching records" },
      { name: "pagination.limit", type: "integer", description: "Page size" },
      { name: "pagination.offset", type: "integer", description: "Current offset" },
      { name: "pagination.hasMore", type: "boolean", description: "Whether more pages exist" },
    ],
    intendedUse:
      "Use this endpoint to query the canonical person registry. These records establish that a person exists in the system with a stable ID. For enriched profile data with experience and education, use /api/people/background instead.",
  },
  {
    method: "GET",
    path: "/api/people/background",
    slug: "api-people-background",
    summary: "Search enriched profiles",
    description:
      "Returns paginated person profiles from enriched sources. Profiles include current role, company, location, and connection data. Use this to find people matching specific criteria for outreach or research.",
    pathParams: [],
    queryParams: [
      { name: "limit", type: "integer", required: false, description: "Results per page (1-100, default 20)" },
      { name: "offset", type: "integer", required: false, description: "Number of results to skip (default 0)" },
      { name: "linkedin_url", type: "string", required: false, description: "Filter by LinkedIn URL (exact match)" },
      { name: "slug", type: "string", required: false, description: "Filter by LinkedIn slug (exact match)" },
      { name: "name", type: "string", required: false, description: "Filter by name (partial match)" },
      { name: "title", type: "string", required: false, description: "Filter by current title (partial match)" },
      { name: "company", type: "string", required: false, description: "Filter by current company name (partial match)" },
      { name: "company_domain", type: "string", required: false, description: "Filter by current company domain (exact match)" },
      { name: "location", type: "string", required: false, description: "Filter by location (partial match)" },
      { name: "country", type: "string", required: false, description: "Filter by country (exact match)" },
    ],
    exampleRequest: "GET /api/people/background?title=VP&company_domain=stripe.com&limit=20",
    responseType: "paginated",
    responseFields: [
      { name: "data", type: "PersonProfile[]", description: "Array of person profiles" },
      { name: "pagination.total", type: "integer", description: "Total matching records" },
      { name: "pagination.hasMore", type: "boolean", description: "Whether more pages exist" },
    ],
    intendedUse:
      "Use this endpoint to find people at specific companies or matching role criteria. Common workflows include building contact lists by filtering on company_domain and title, or searching for specific individuals by name.",
  },
  {
    method: "GET",
    path: "/api/people/background/{slug}",
    slug: "api-people-background-slug",
    summary: "Get person with experience and education",
    description:
      "Returns a complete person record including their profile, full work history, and education. The slug is the LinkedIn profile identifier (the part after /in/ in the URL).",
    pathParams: [
      { name: "slug", type: "string", description: "LinkedIn profile slug", example: "johndoe" },
    ],
    queryParams: [],
    exampleRequest: "GET /api/people/background/satyanadella",
    responseType: "object",
    responseFields: [
      { name: "id", type: "uuid", description: "Internal record ID" },
      { name: "linkedin_url", type: "string", description: "Full LinkedIn profile URL" },
      { name: "full_name", type: "string", description: "Person's full name" },
      { name: "headline", type: "string", description: "LinkedIn headline" },
      { name: "latest_title", type: "string", description: "Current job title" },
      { name: "latest_company", type: "string", description: "Current company name" },
      { name: "experience", type: "PersonExperience[]", description: "Array of work history records" },
      { name: "education", type: "PersonEducation[]", description: "Array of education records" },
    ],
    intendedUse:
      "Use this endpoint when you need complete details about a specific person including their career trajectory. Useful for account research, validating contacts, or building person profile pages.",
  },
  {
    method: "GET",
    path: "/api/people/background/{slug}/experience",
    slug: "api-people-background-slug-experience",
    summary: "Get experience only",
    description:
      "Returns only the work history for a person, without profile or education data. Use this when you only need employment history.",
    pathParams: [
      { name: "slug", type: "string", description: "LinkedIn profile slug", example: "johndoe" },
    ],
    queryParams: [],
    exampleRequest: "GET /api/people/background/satyanadella/experience",
    responseType: "list",
    responseFields: [
      { name: "[].company", type: "string", description: "Company name" },
      { name: "[].company_domain", type: "string", description: "Company domain" },
      { name: "[].title", type: "string", description: "Job title" },
      { name: "[].start_date", type: "date", description: "Role start date" },
      { name: "[].end_date", type: "date", description: "Role end date (null if current)" },
      { name: "[].is_current", type: "boolean", description: "Whether this is the current role" },
    ],
    intendedUse:
      "Use this endpoint when analyzing someone's career path or finding where they've previously worked. Useful for identifying shared connections, alumni networks, or validating tenure at specific companies.",
  },
  {
    method: "GET",
    path: "/api/people/background/{slug}/education",
    slug: "api-people-background-slug-education",
    summary: "Get education only",
    description:
      "Returns only education records for a person. Use this when you specifically need academic background without other profile data.",
    pathParams: [
      { name: "slug", type: "string", description: "LinkedIn profile slug", example: "johndoe" },
    ],
    queryParams: [],
    exampleRequest: "GET /api/people/background/satyanadella/education",
    responseType: "list",
    responseFields: [
      { name: "[].school_name", type: "string", description: "Institution name" },
      { name: "[].degree", type: "string", description: "Degree type" },
      { name: "[].field_of_study", type: "string", description: "Major or concentration" },
      { name: "[].start_date", type: "date", description: "Start date" },
      { name: "[].end_date", type: "date", description: "End date" },
    ],
    intendedUse:
      "Use this endpoint for alumni-based targeting or when educational background is relevant to your analysis. Useful for identifying school connections or filtering by academic credentials.",
  },
  {
    method: "GET",
    path: "/api/people/discovery",
    slug: "api-people-discovery",
    summary: "Search discovery people",
    description:
      "Returns paginated lightweight person records from discovery sources. Contains basic profile information suitable for initial filtering before full enrichment.",
    pathParams: [],
    queryParams: [
      { name: "limit", type: "integer", required: false, description: "Results per page (1-100, default 20)" },
      { name: "offset", type: "integer", required: false, description: "Number of results to skip (default 0)" },
      { name: "linkedin_url", type: "string", required: false, description: "Filter by LinkedIn URL" },
      { name: "name", type: "string", required: false, description: "Filter by name (partial match)" },
      { name: "title", type: "string", required: false, description: "Filter by title (partial match)" },
      { name: "company", type: "string", required: false, description: "Filter by company name (partial match)" },
      { name: "company_domain", type: "string", required: false, description: "Filter by company domain" },
      { name: "location", type: "string", required: false, description: "Filter by location (partial match)" },
    ],
    exampleRequest: "GET /api/people/discovery?company_domain=notion.so&title=Engineer",
    responseType: "paginated",
    responseFields: [
      { name: "data", type: "PersonDiscovery[]", description: "Array of discovery person records" },
      { name: "pagination.total", type: "integer", description: "Total matching records" },
      { name: "pagination.hasMore", type: "boolean", description: "Whether more pages exist" },
    ],
    intendedUse:
      "Use this endpoint for high-volume person searches where you need basic data only. Discovery records are lighter weight than full profiles, suitable for initial filtering before selective enrichment.",
  },
  {
    method: "GET",
    path: "/api/people/discovery/{slug}",
    slug: "api-people-discovery-slug",
    summary: "Get discovery person by slug",
    description:
      "Returns a single discovery person record by LinkedIn slug. Provides basic profile data without full enrichment.",
    pathParams: [
      { name: "slug", type: "string", description: "LinkedIn profile slug", example: "johndoe" },
    ],
    queryParams: [],
    exampleRequest: "GET /api/people/discovery/johndoe",
    responseType: "object",
    responseFields: [
      { name: "id", type: "uuid", description: "Internal record ID" },
      { name: "linkedin_url", type: "string", description: "LinkedIn profile URL" },
      { name: "full_name", type: "string", description: "Person's name" },
      { name: "latest_title", type: "string", description: "Current title" },
      { name: "latest_company", type: "string", description: "Current company" },
      { name: "company_domain", type: "string", description: "Current company domain" },
    ],
    intendedUse:
      "Use this endpoint to check if a person exists in discovery data or when lightweight data is sufficient. Useful for validation before triggering enrichment.",
  },
  {
    method: "GET",
    path: "/api/people/by-past-company",
    slug: "api-people-by-past-company",
    summary: "Find people by past employer",
    description:
      "Returns people who previously worked at a specific company. At least one company identifier (domain, LinkedIn URL, or name) is required. Results include the person's current role plus their experience at the target company.",
    pathParams: [],
    queryParams: [
      { name: "limit", type: "integer", required: false, description: "Results per page (1-100, default 20)" },
      { name: "offset", type: "integer", required: false, description: "Number of results to skip (default 0)" },
      { name: "company_domain", type: "string", required: false, description: "Past company domain (e.g., 'stripe.com')" },
      { name: "company_linkedin_url", type: "string", required: false, description: "Past company LinkedIn URL" },
      { name: "company_name", type: "string", required: false, description: "Past company name (partial match)" },
    ],
    exampleRequest: "GET /api/people/by-past-company?company_domain=stripe.com&limit=50",
    responseType: "paginated",
    responseFields: [
      { name: "data[].linkedin_url", type: "string", description: "Person's LinkedIn URL" },
      { name: "data[].full_name", type: "string", description: "Person's name" },
      { name: "data[].current_company", type: "string", description: "Where they work now" },
      { name: "data[].current_title", type: "string", description: "Current role" },
      { name: "data[].past_experience_at_company", type: "PersonExperience[]", description: "Their roles at the queried company" },
    ],
    intendedUse:
      "Use this endpoint for alumni-based prospecting. Find people who worked at a competitor, customer, or specific company and see where they went. Useful for building warm outreach lists based on shared company history.",
  },
  // ============================================================
  // Leads
  // ============================================================
  {
    method: "GET",
    path: "/api/leads/{slug}",
    slug: "api-leads-slug",
    summary: "Get leads matching company's ICP",
    description:
      "Returns people who match a company's Ideal Customer Profile (ICP) criteria. The slug identifies the company whose ICP should be used (e.g., 'ramp', 'vanta'). Results include leads at companies matching the ICP plus flags for people who previously worked at known customers.",
    pathParams: [
      { name: "slug", type: "string", description: "Company slug identifying the ICP to use", example: "ramp" },
    ],
    queryParams: [],
    exampleRequest: "GET /api/leads/ramp",
    responseType: "object",
    responseFields: [
      { name: "slug", type: "string", description: "Company slug used for lookup" },
      { name: "domain", type: "string", description: "Company domain" },
      { name: "company_name", type: "string", description: "Company name" },
      { name: "icp", type: "ICP", description: "The ICP criteria used for matching" },
      { name: "leads", type: "Lead[]", description: "Array of matching leads" },
      { name: "total_leads", type: "integer", description: "Total number of leads returned" },
    ],
    intendedUse:
      "Use this endpoint to get a qualified lead list based on pre-defined ICP criteria. The ICP includes company criteria (industry, size, geography) and person criteria (titles, seniority). Leads are flagged if they previously worked at a known customer of the target company.",
  },
  // ============================================================
  // Workflows
  // ============================================================
  {
    method: "GET",
    path: "/api/workflows",
    slug: "api-workflows",
    summary: "List workflows",
    description:
      "Returns available enrichment workflow definitions. Workflows define data sources and transformation pipelines used to populate the database. This endpoint is primarily for administrative purposes.",
    pathParams: [],
    queryParams: [
      { name: "workflow_slug", type: "string", required: false, description: "Filter by workflow slug" },
      { name: "provider", type: "string", required: false, description: "Filter by data provider (e.g., 'clay')" },
      { name: "platform", type: "string", required: false, description: "Filter by platform" },
      { name: "entity_type", type: "string", required: false, description: "Filter by entity type ('company' or 'person')" },
    ],
    exampleRequest: "GET /api/workflows?entity_type=company",
    responseType: "list",
    responseFields: [
      { name: "[].id", type: "uuid", description: "Workflow ID" },
      { name: "[].workflow_slug", type: "string", description: "Unique workflow identifier" },
      { name: "[].provider", type: "string", description: "Data provider" },
      { name: "[].entity_type", type: "string", description: "Entity type this workflow produces" },
      { name: "[].payload_type", type: "string", description: "Type of data payload" },
      { name: "[].description", type: "string", description: "Workflow description" },
    ],
    intendedUse:
      "Use this endpoint to understand what data pipelines exist and their configurations. Useful for debugging data freshness issues or understanding the source of specific data fields.",
  },
  {
    method: "GET",
    path: "/api/workflows/{slug}",
    slug: "api-workflows-slug",
    summary: "Get workflow by slug",
    description:
      "Returns a single workflow definition by its slug. Provides details about the workflow's provider, entity type, and configuration.",
    pathParams: [
      { name: "slug", type: "string", description: "Workflow slug identifier", example: "clay-company-firmographics" },
    ],
    queryParams: [],
    exampleRequest: "GET /api/workflows/clay-company-firmographics",
    responseType: "object",
    responseFields: [
      { name: "id", type: "uuid", description: "Workflow ID" },
      { name: "workflow_slug", type: "string", description: "Unique slug" },
      { name: "provider", type: "string", description: "Data provider" },
      { name: "platform", type: "string", description: "Platform" },
      { name: "entity_type", type: "string", description: "Entity type" },
      { name: "payload_type", type: "string", description: "Payload type" },
      { name: "description", type: "string", description: "Description" },
    ],
    intendedUse:
      "Use this endpoint to get details about a specific workflow. Useful when you need to understand the source and configuration of a particular data pipeline.",
  },
  // ============================================================
  // OpenAPI
  // ============================================================
  {
    method: "GET",
    path: "/api/openapi",
    slug: "api-openapi",
    summary: "OpenAPI specification",
    description:
      "Returns the complete OpenAPI 3.0 specification for this API as JSON. Use this to generate client SDKs, import into API tools, or understand the full schema definitions.",
    pathParams: [],
    queryParams: [],
    exampleRequest: "GET /api/openapi",
    responseType: "object",
    responseFields: [
      { name: "openapi", type: "string", description: "OpenAPI version (3.0.3)" },
      { name: "info", type: "object", description: "API metadata (title, version, description)" },
      { name: "paths", type: "object", description: "All endpoint definitions" },
      { name: "components.schemas", type: "object", description: "All schema definitions" },
    ],
    intendedUse:
      "Use this endpoint to get machine-readable API documentation. Import into tools like Postman, use for SDK generation, or reference for complete schema details not shown in this documentation.",
  },
];

export function getEndpointBySlug(slug: string): EndpointDoc | undefined {
  return endpointDocs.find((e) => e.slug === slug);
}

export function pathToSlug(path: string): string {
  return path.replace(/^\//, "").replace(/\//g, "-").replace(/[{}]/g, "");
}
