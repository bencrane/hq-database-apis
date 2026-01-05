import { z, UUIDSchema, TimestampSchema } from "./common";

// ============================================================
// reference.enrichment_workflow_registry
// ============================================================

export const WorkflowSchema = z
  .object({
    id: UUIDSchema,
    workflow_slug: z.string().openapi({ example: "clay-company-firmographics" }),
    provider: z.string().openapi({ example: "clay" }),
    platform: z.string().openapi({ example: "clay" }),
    payload_type: z.string().openapi({ example: "company_firmographics" }),
    entity_type: z.string().openapi({ example: "company" }),
    description: z.string().nullable(),
    created_at: TimestampSchema.nullable(),
  })
  .openapi("Workflow");

export const WorkflowSearchQuerySchema = z
  .object({
    workflow_slug: z.string().optional(),
    provider: z.string().optional(),
    platform: z.string().optional(),
    entity_type: z.string().optional(),
  })
  .openapi("WorkflowSearchQuery");

// ============================================================
// Type Exports
// ============================================================

export type Workflow = z.infer<typeof WorkflowSchema>;
export type WorkflowSearchQuery = z.infer<typeof WorkflowSearchQuerySchema>;
