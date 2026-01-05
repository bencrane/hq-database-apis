import { z, UUIDSchema, TimestampSchema } from "./common";

// ============================================================
// extracted.company_firmographics (enriched)
// ============================================================

export const CompanyFirmographicsSchema = z
  .object({
    id: UUIDSchema,
    raw_payload_id: UUIDSchema,
    company_domain: z.string().openapi({ example: "acme.com" }),
    linkedin_url: z.string().url().nullable().openapi({ example: "https://linkedin.com/company/acme" }),
    linkedin_slug: z.string().nullable().openapi({ example: "acme" }),
    linkedin_org_id: z.number().int().nullable(),
    clay_company_id: z.number().int().nullable(),
    name: z.string().nullable().openapi({ example: "Acme Corporation" }),
    description: z.string().nullable(),
    website: z.string().url().nullable().openapi({ example: "https://acme.com" }),
    logo_url: z.string().url().nullable(),
    company_type: z.string().nullable().openapi({ example: "Privately Held" }),
    industry: z.string().nullable().openapi({ example: "Technology" }),
    founded_year: z.number().int().nullable().openapi({ example: 2015 }),
    size_range: z.string().nullable().openapi({ example: "201-500" }),
    employee_count: z.number().int().nullable().openapi({ example: 350 }),
    follower_count: z.number().int().nullable(),
    country: z.string().nullable().openapi({ example: "United States" }),
    locality: z.string().nullable().openapi({ example: "San Francisco" }),
    primary_location: z.record(z.unknown()).nullable(),
    all_locations: z.record(z.unknown()).nullable(),
    specialties: z.array(z.string()).nullable().openapi({ example: ["SaaS", "AI"] }),
    source_last_refresh: TimestampSchema.nullable(),
    created_at: TimestampSchema.nullable(),
  })
  .openapi("CompanyFirmographics");

export const CompanyFirmographicsSearchQuerySchema = z
  .object({
    domain: z.string().optional(),
    name: z.string().optional(),
    industry: z.string().optional(),
    country: z.string().optional(),
    size_range: z.string().optional(),
    min_employees: z.coerce.number().int().optional(),
    max_employees: z.coerce.number().int().optional(),
    founded_after: z.coerce.number().int().optional(),
    founded_before: z.coerce.number().int().optional(),
  })
  .openapi("CompanyFirmographicsSearchQuery");

// ============================================================
// extracted.company_discovery (lightweight)
// ============================================================

export const CompanyDiscoverySchema = z
  .object({
    id: UUIDSchema,
    raw_payload_id: UUIDSchema,
    domain: z.string().openapi({ example: "acme.com" }),
    name: z.string().nullable().openapi({ example: "Acme Corporation" }),
    linkedin_url: z.string().url().nullable(),
    linkedin_company_id: z.number().int().nullable(),
    clay_company_id: z.number().int().nullable(),
    size: z.string().nullable().openapi({ example: "201-500" }),
    type: z.string().nullable().openapi({ example: "Privately Held" }),
    country: z.string().nullable().openapi({ example: "United States" }),
    location: z.string().nullable().openapi({ example: "San Francisco, CA" }),
    industry: z.string().nullable().openapi({ example: "Technology" }),
    industries: z.record(z.unknown()).nullable(),
    description: z.string().nullable(),
    annual_revenue: z.string().nullable().openapi({ example: "$10M-$50M" }),
    total_funding_amount_range_usd: z.string().nullable().openapi({ example: "$50M-$100M" }),
    resolved_domain: z.record(z.unknown()).nullable(),
    derived_datapoints: z.record(z.unknown()).nullable(),
    source_last_refresh: TimestampSchema.nullable(),
    created_at: TimestampSchema.nullable(),
    updated_at: TimestampSchema.nullable(),
  })
  .openapi("CompanyDiscovery");

export const CompanyDiscoverySearchQuerySchema = z
  .object({
    domain: z.string().optional(),
    name: z.string().optional(),
    industry: z.string().optional(),
    country: z.string().optional(),
    size: z.string().optional(),
  })
  .openapi("CompanyDiscoverySearchQuery");

// ============================================================
// Type Exports
// ============================================================

export type CompanyFirmographics = z.infer<typeof CompanyFirmographicsSchema>;
export type CompanyFirmographicsSearchQuery = z.infer<typeof CompanyFirmographicsSearchQuerySchema>;
export type CompanyDiscovery = z.infer<typeof CompanyDiscoverySchema>;
export type CompanyDiscoverySearchQuery = z.infer<typeof CompanyDiscoverySearchQuerySchema>;

