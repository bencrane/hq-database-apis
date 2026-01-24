import { z } from "zod";

// =============================================================================
// Org Schemas
// =============================================================================

export const CreateOrgSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase alphanumeric with hyphens only"
    ),
});

export const UpdateOrgSchema = z.object({
  name: z.string().min(1).optional(),
  services_enabled: z
    .object({
      intent: z.boolean().optional(),
      inbound: z.boolean().optional(),
      outbound: z.boolean().optional(),
    })
    .optional(),
  status: z.enum(["active", "suspended", "cancelled"]).optional(),
});

// =============================================================================
// Org User Schemas
// =============================================================================

export const AddOrgUserSchema = z.object({
  user_id: z.string().uuid("user_id must be a valid UUID"),
  role: z.enum(["owner", "admin", "member", "viewer"]),
});

// =============================================================================
// Email Account Schemas
// =============================================================================

export const AddEmailAccountSchema = z.object({
  email: z.string().email("Invalid email address"),
  provider: z.enum(["google", "microsoft", "other"]),
  credentials_encrypted: z.string().optional(),
  smartlead_account_id: z.string().optional(),
});

// =============================================================================
// LinkedIn Account Schemas
// =============================================================================

export const AddLinkedInAccountSchema = z.object({
  linkedin_url: z.string().url("Invalid LinkedIn URL"),
  session_cookie_encrypted: z.string().optional(),
});

// =============================================================================
// Query Schemas
// =============================================================================

export const PaginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export const UserIdQuerySchema = z.object({
  user_id: z.string().uuid("user_id must be a valid UUID"),
});

// =============================================================================
// Access Request Schemas
// =============================================================================

export const RequestAccessSchema = z.object({
  email: z.string().email("Invalid email address"),
});
