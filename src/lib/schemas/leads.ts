import { z } from "./common";

// ============================================================
// ICP Criteria Schemas
// ============================================================

export const CompanyCriteriaSchema = z
  .object({
    industries: z.array(z.string()).optional(),
    size_buckets: z.array(z.string()).optional(),
    employee_count_min: z.number().int().optional(),
    employee_count_max: z.number().int().optional(),
    countries: z.array(z.string()).optional(),
    founded_min: z.number().int().optional(),
    founded_max: z.number().int().optional(),
  })
  .openapi("CompanyCriteria");

export const PersonCriteriaSchema = z
  .object({
    title_contains_any: z.array(z.string()).optional(),
    title_contains_all: z.array(z.string()).optional(),
    seniority: z.array(z.string()).optional(),
  })
  .openapi("PersonCriteria");

export const ICPSchema = z
  .object({
    company_criteria: CompanyCriteriaSchema.nullable(),
    person_criteria: PersonCriteriaSchema.nullable(),
  })
  .openapi("ICP");

// ============================================================
// Lead Schema
// ============================================================

export const LeadSchema = z
  .object({
    linkedin_url: z.string().url(),
    linkedin_slug: z.string().nullable(),
    full_name: z.string().nullable(),
    title: z.string().nullable(),
    company_name: z.string().nullable(),
    company_domain: z.string().nullable(),
    company_industry: z.string().nullable(),
    company_size: z.string().nullable(),
    is_worked_at_customer: z.boolean(),
    worked_at_customer_company: z.string().nullable(),
  })
  .openapi("Lead");

// ============================================================
// Leads Response Schema
// ============================================================

export const LeadsResponseSchema = z
  .object({
    domain: z.string(),
    company_name: z.string().nullable(),
    icp: ICPSchema,
    leads: z.array(LeadSchema),
    total_leads: z.number().int(),
  })
  .openapi("LeadsResponse");

// ============================================================
// Type Exports
// ============================================================

export type CompanyCriteria = z.infer<typeof CompanyCriteriaSchema>;
export type PersonCriteria = z.infer<typeof PersonCriteriaSchema>;
export type ICP = z.infer<typeof ICPSchema>;
export type Lead = z.infer<typeof LeadSchema>;
export type LeadsResponse = z.infer<typeof LeadsResponseSchema>;

