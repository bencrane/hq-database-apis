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

// =============================================================================
// Org ID Query Schema
// =============================================================================

export const OrgIdQuerySchema = z.object({
  org_id: z.string().uuid("org_id must be a valid UUID"),
  limit: z.coerce.number().min(1).max(100).default(50).optional(),
  offset: z.coerce.number().min(0).default(0).optional(),
});

// =============================================================================
// Automation Schemas
// =============================================================================

export const CreateAutomationSchema = z.object({
  org_id: z.string().uuid("org_id must be a valid UUID"),
  name: z.string().min(1, "Name is required"),
  trigger_type: z.enum(["new_lead", "lead_status_change", "scheduled", "manual"]),
  trigger_config: z.record(z.string(), z.unknown()).optional(),
  actions: z.array(z.object({
    type: z.string(),
    config: z.record(z.string(), z.unknown()).optional(),
  })),
  is_active: z.boolean().default(true),
});

export const UpdateAutomationSchema = z.object({
  name: z.string().min(1).optional(),
  trigger_type: z.enum(["new_lead", "lead_status_change", "scheduled", "manual"]).optional(),
  trigger_config: z.record(z.string(), z.unknown()).optional(),
  actions: z.array(z.object({
    type: z.string(),
    config: z.record(z.string(), z.unknown()).optional(),
  })).optional(),
  is_active: z.boolean().optional(),
});

// =============================================================================
// CRM Schemas
// =============================================================================

export const ConnectCRMSchema = z.object({
  org_id: z.string().uuid("org_id must be a valid UUID"),
  provider: z.enum(["salesforce", "hubspot", "pipedrive", "zoho", "other"]),
  credentials_encrypted: z.string().optional(),
  access_token_encrypted: z.string().optional(),
  refresh_token_encrypted: z.string().optional(),
  instance_url: z.string().url().optional(),
});

export const TestCRMSchema = z.object({
  org_id: z.string().uuid("org_id must be a valid UUID"),
  connection_id: z.string().uuid("connection_id must be a valid UUID"),
});

export const DisconnectCRMSchema = z.object({
  org_id: z.string().uuid("org_id must be a valid UUID"),
  connection_id: z.string().uuid("connection_id must be a valid UUID"),
});

// =============================================================================
// Account Schemas (new structure)
// =============================================================================

export const CreateEmailAccountSchema = z.object({
  org_id: z.string().uuid("org_id must be a valid UUID"),
  email: z.string().email("Invalid email address"),
  provider: z.enum(["google", "microsoft", "other"]),
  credentials_encrypted: z.string().optional(),
  smartlead_account_id: z.string().optional(),
});

export const CreateLinkedInAccountSchema = z.object({
  org_id: z.string().uuid("org_id must be a valid UUID"),
  linkedin_url: z.string().url("Invalid LinkedIn URL"),
  session_cookie_encrypted: z.string().optional(),
});

// =============================================================================
// Slack Schemas
// =============================================================================

export const ConnectSlackSchema = z.object({
  org_id: z.string().uuid("org_id must be a valid UUID"),
  access_token_encrypted: z.string(),
  team_id: z.string(),
  team_name: z.string(),
  channel_id: z.string().optional(),
  channel_name: z.string().optional(),
});

export const DisconnectSlackSchema = z.object({
  org_id: z.string().uuid("org_id must be a valid UUID"),
  connection_id: z.string().uuid("connection_id must be a valid UUID"),
});

// =============================================================================
// Invite Schema
// =============================================================================

export const InviteMemberSchema = z.object({
  org_id: z.string().uuid("org_id must be a valid UUID"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member", "viewer"]).default("member"),
});
