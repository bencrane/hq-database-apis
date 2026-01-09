import { z, UUIDSchema, TimestampSchema } from "./common";

// ============================================================
// core.companies (canonical)
// ============================================================

export const CoreCompanySchema = z
  .object({
    id: UUIDSchema,
    domain: z.string().openapi({ example: "acme.com" }),
    name: z.string().nullable().openapi({ example: "Acme Corporation" }),
    linkedin_url: z.string().url().nullable().openapi({ example: "https://linkedin.com/company/acme" }),
    created_at: TimestampSchema,
    updated_at: TimestampSchema,
  })
  .openapi("CoreCompany");

export const CoreCompanySearchQuerySchema = z
  .object({
    domain: z.string().optional(),
    name: z.string().optional(),
  })
  .openapi("CoreCompanySearchQuery");

// ============================================================
// core.people (canonical)
// ============================================================

export const CorePersonSchema = z
  .object({
    id: UUIDSchema,
    linkedin_url: z.string().url().openapi({ example: "https://linkedin.com/in/johndoe" }),
    linkedin_slug: z.string().nullable().openapi({ example: "johndoe" }),
    full_name: z.string().nullable().openapi({ example: "John Doe" }),
    created_at: TimestampSchema,
    updated_at: TimestampSchema,
  })
  .openapi("CorePerson");

export const CorePersonSearchQuerySchema = z
  .object({
    linkedin_url: z.string().optional(),
    linkedin_slug: z.string().optional(),
    full_name: z.string().optional(),
  })
  .openapi("CorePersonSearchQuery");

// ============================================================
// Type Exports
// ============================================================

export type CoreCompany = z.infer<typeof CoreCompanySchema>;
export type CoreCompanySearchQuery = z.infer<typeof CoreCompanySearchQuerySchema>;
export type CorePerson = z.infer<typeof CorePersonSchema>;
export type CorePersonSearchQuery = z.infer<typeof CorePersonSearchQuerySchema>;
