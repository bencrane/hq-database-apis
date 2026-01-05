import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

// Extend Zod with OpenAPI support
extendZodWithOpenApi(z);

// Re-export z with OpenAPI extension
export { z };

// ============================================================
// Common Schemas
// ============================================================

export const UUIDSchema = z
  .string()
  .uuid()
  .openapi({ example: "550e8400-e29b-41d4-a716-446655440000" });

export const TimestampSchema = z
  .string()
  .datetime()
  .openapi({ example: "2025-01-05T12:00:00Z" });

export const DateSchema = z.string().date().openapi({ example: "2025-01-05" });

export const PaginationQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
    .openapi({ example: 20 }),
  offset: z.coerce.number().int().min(0).default(0).openapi({ example: 0 }),
});

export const ErrorResponseSchema = z
  .object({
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.record(z.unknown()).optional(),
    }),
  })
  .openapi("ErrorResponse");

// ============================================================
// Type Exports
// ============================================================

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

