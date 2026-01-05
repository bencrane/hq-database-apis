import { z, UUIDSchema, TimestampSchema, DateSchema } from "./common";

// ============================================================
// extracted.person_profile (enriched)
// ============================================================

export const PersonProfileSchema = z
  .object({
    id: UUIDSchema,
    raw_payload_id: UUIDSchema,
    linkedin_url: z.string().url().openapi({ example: "https://linkedin.com/in/johndoe" }),
    linkedin_slug: z.string().nullable().openapi({ example: "johndoe" }),
    linkedin_profile_id: z.number().int().nullable(),
    first_name: z.string().nullable().openapi({ example: "John" }),
    last_name: z.string().nullable().openapi({ example: "Doe" }),
    full_name: z.string().nullable().openapi({ example: "John Doe" }),
    headline: z.string().nullable().openapi({ example: "VP of Engineering at Acme" }),
    summary: z.string().nullable(),
    country: z.string().nullable().openapi({ example: "United States" }),
    location_name: z.string().nullable().openapi({ example: "San Francisco, CA" }),
    connections: z.number().int().nullable().openapi({ example: 500 }),
    num_followers: z.number().int().nullable().openapi({ example: 2500 }),
    picture_url: z.string().url().nullable(),
    jobs_count: z.number().int().nullable(),
    latest_title: z.string().nullable().openapi({ example: "VP of Engineering" }),
    latest_company: z.string().nullable().openapi({ example: "Acme" }),
    latest_company_domain: z.string().nullable().openapi({ example: "acme.com" }),
    latest_company_linkedin_url: z.string().url().nullable(),
    latest_company_org_id: z.number().int().nullable(),
    latest_locality: z.string().nullable(),
    latest_start_date: DateSchema.nullable(),
    latest_end_date: DateSchema.nullable(),
    latest_is_current: z.boolean().nullable(),
    certifications: z.array(z.record(z.unknown())).nullable(),
    languages: z.array(z.record(z.unknown())).nullable(),
    courses: z.array(z.record(z.unknown())).nullable(),
    patents: z.array(z.record(z.unknown())).nullable(),
    projects: z.array(z.record(z.unknown())).nullable(),
    publications: z.array(z.record(z.unknown())).nullable(),
    volunteering: z.array(z.record(z.unknown())).nullable(),
    awards: z.array(z.record(z.unknown())).nullable(),
    source_last_refresh: TimestampSchema.nullable(),
    created_at: TimestampSchema.nullable(),
    updated_at: TimestampSchema.nullable(),
  })
  .openapi("PersonProfile");

export const PersonProfileSearchQuerySchema = z
  .object({
    linkedin_url: z.string().optional(),
    slug: z.string().optional(),
    name: z.string().optional(),
    title: z.string().optional(),
    company: z.string().optional(),
    company_domain: z.string().optional(),
    location: z.string().optional(),
    country: z.string().optional(),
  })
  .openapi("PersonProfileSearchQuery");

// ============================================================
// extracted.person_experience
// ============================================================

export const PersonExperienceSchema = z
  .object({
    id: UUIDSchema,
    raw_payload_id: UUIDSchema,
    linkedin_url: z.string().url(),
    company: z.string().nullable().openapi({ example: "Acme" }),
    company_domain: z.string().nullable().openapi({ example: "acme.com" }),
    company_linkedin_url: z.string().url().nullable(),
    company_org_id: z.number().int().nullable(),
    title: z.string().nullable().openapi({ example: "VP of Engineering" }),
    summary: z.string().nullable(),
    locality: z.string().nullable().openapi({ example: "San Francisco, CA" }),
    start_date: DateSchema.nullable().openapi({ example: "2023-01-15" }),
    end_date: DateSchema.nullable(),
    is_current: z.boolean().nullable().openapi({ example: true }),
    experience_order: z.number().int().nullable().openapi({ example: 0 }),
    created_at: TimestampSchema.nullable(),
  })
  .openapi("PersonExperience");

// ============================================================
// extracted.person_education
// ============================================================

export const PersonEducationSchema = z
  .object({
    id: UUIDSchema,
    raw_payload_id: UUIDSchema,
    linkedin_url: z.string().url(),
    school_name: z.string().nullable().openapi({ example: "Stanford University" }),
    degree: z.string().nullable().openapi({ example: "Bachelor of Science" }),
    field_of_study: z.string().nullable().openapi({ example: "Computer Science" }),
    start_date: DateSchema.nullable(),
    end_date: DateSchema.nullable(),
    grade: z.string().nullable(),
    activities: z.string().nullable(),
    education_order: z.number().int().nullable(),
    created_at: TimestampSchema.nullable(),
  })
  .openapi("PersonEducation");

// ============================================================
// extracted.person_discovery (lightweight)
// ============================================================

export const PersonDiscoverySchema = z
  .object({
    id: UUIDSchema,
    raw_payload_id: UUIDSchema,
    linkedin_url: z.string().url().openapi({ example: "https://linkedin.com/in/johndoe" }),
    first_name: z.string().nullable().openapi({ example: "John" }),
    last_name: z.string().nullable().openapi({ example: "Doe" }),
    full_name: z.string().nullable().openapi({ example: "John Doe" }),
    location_name: z.string().nullable().openapi({ example: "San Francisco, CA" }),
    company_domain: z.string().nullable().openapi({ example: "acme.com" }),
    latest_title: z.string().nullable().openapi({ example: "VP of Engineering" }),
    latest_company: z.string().nullable().openapi({ example: "Acme" }),
    latest_start_date: DateSchema.nullable(),
    clay_company_table_id: z.string().nullable(),
    clay_company_record_id: z.string().nullable(),
    created_at: TimestampSchema.nullable(),
    updated_at: TimestampSchema.nullable(),
  })
  .openapi("PersonDiscovery");

export const PersonDiscoverySearchQuerySchema = z
  .object({
    linkedin_url: z.string().optional(),
    name: z.string().optional(),
    title: z.string().optional(),
    company: z.string().optional(),
    company_domain: z.string().optional(),
    location: z.string().optional(),
  })
  .openapi("PersonDiscoverySearchQuery");

// ============================================================
// By Past Company Query
// ============================================================

export const ByPastCompanyQuerySchema = z
  .object({
    company_domain: z.string().optional(),
    company_linkedin_url: z.string().optional(),
    company_name: z.string().optional(),
  })
  .openapi("ByPastCompanyQuery");

export const PersonWithPastExperienceSchema = z
  .object({
    linkedin_url: z.string().url(),
    linkedin_slug: z.string().nullable(),
    full_name: z.string().nullable(),
    headline: z.string().nullable(),
    current_company: z.string().nullable(),
    current_title: z.string().nullable(),
    picture_url: z.string().url().nullable(),
    past_experience_at_company: z.array(PersonExperienceSchema),
  })
  .openapi("PersonWithPastExperience");

// ============================================================
// Combined Response (for single person with details)
// ============================================================

export const PersonWithDetailsSchema = PersonProfileSchema.extend({
  experience: z.array(PersonExperienceSchema),
  education: z.array(PersonEducationSchema),
}).openapi("PersonWithDetails");

// ============================================================
// Type Exports
// ============================================================

export type PersonProfile = z.infer<typeof PersonProfileSchema>;
export type PersonProfileSearchQuery = z.infer<typeof PersonProfileSearchQuerySchema>;
export type PersonExperience = z.infer<typeof PersonExperienceSchema>;
export type PersonEducation = z.infer<typeof PersonEducationSchema>;
export type PersonDiscovery = z.infer<typeof PersonDiscoverySchema>;
export type PersonDiscoverySearchQuery = z.infer<typeof PersonDiscoverySearchQuerySchema>;
export type ByPastCompanyQuery = z.infer<typeof ByPastCompanyQuerySchema>;
export type PersonWithPastExperience = z.infer<typeof PersonWithPastExperienceSchema>;
export type PersonWithDetails = z.infer<typeof PersonWithDetailsSchema>;

