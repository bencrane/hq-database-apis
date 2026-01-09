import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import {
  PaginationQuerySchema,
  ErrorResponseSchema,
  CoreCompanySchema,
  CoreCompanySearchQuerySchema,
  CorePersonSchema,
  CorePersonSearchQuerySchema,
  CompanyFirmographicsSchema,
  CompanyFirmographicsSearchQuerySchema,
  CompanyDiscoverySchema,
  CompanyDiscoverySearchQuerySchema,
  PersonProfileSchema,
  PersonProfileSearchQuerySchema,
  PersonExperienceSchema,
  PersonEducationSchema,
  PersonDiscoverySchema,
  PersonDiscoverySearchQuerySchema,
  ByPastCompanyQuerySchema,
  PersonWithPastExperienceSchema,
  PersonWithDetailsSchema,
  WorkflowSchema,
  WorkflowSearchQuerySchema,
  LeadsResponseSchema,
  LeadSchema,
  ICPSchema,
} from "@/lib/schemas";

// Create registry
export const registry = new OpenAPIRegistry();

// ============================================================
// Register Schemas
// ============================================================

registry.register("ErrorResponse", ErrorResponseSchema);
registry.register("CoreCompany", CoreCompanySchema);
registry.register("CorePerson", CorePersonSchema);
registry.register("CompanyFirmographics", CompanyFirmographicsSchema);
registry.register("CompanyDiscovery", CompanyDiscoverySchema);
registry.register("PersonProfile", PersonProfileSchema);
registry.register("PersonExperience", PersonExperienceSchema);
registry.register("PersonEducation", PersonEducationSchema);
registry.register("PersonDiscovery", PersonDiscoverySchema);
registry.register("PersonWithDetails", PersonWithDetailsSchema);
registry.register("PersonWithPastExperience", PersonWithPastExperienceSchema);
registry.register("Workflow", WorkflowSchema);
registry.register("Lead", LeadSchema);
registry.register("ICP", ICPSchema);
registry.register("LeadsResponse", LeadsResponseSchema);

// ============================================================
// Helper: Paginated Response Schema
// ============================================================

function paginatedResponse<T extends z.ZodTypeAny>(itemSchema: T, name: string) {
  return z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      total: z.number(),
      limit: z.number(),
      offset: z.number(),
      hasMore: z.boolean(),
    }),
  }).openapi(name);
}

// ============================================================
// Companies Endpoints
// ============================================================

registry.registerPath({
  method: "get",
  path: "/api/companies",
  summary: "List canonical companies",
  description: "List canonical company records from core.companies.",
  tags: ["Companies"],
  request: {
    query: PaginationQuerySchema.merge(CoreCompanySearchQuerySchema),
  },
  responses: {
    200: {
      description: "List of canonical companies",
      content: {
        "application/json": {
          schema: paginatedResponse(CoreCompanySchema, "CoreCompanyList"),
        },
      },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/companies/firmo",
  summary: "Search company firmographics",
  description: "Search and list enriched company firmographics data.",
  tags: ["Companies"],
  request: {
    query: PaginationQuerySchema.merge(CompanyFirmographicsSearchQuerySchema),
  },
  responses: {
    200: {
      description: "List of enriched companies",
      content: {
        "application/json": {
          schema: paginatedResponse(CompanyFirmographicsSchema, "CompanyFirmographicsList"),
        },
      },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/companies/firmo/{domain}",
  summary: "Get enriched company by domain",
  description: "Get a single enriched company by domain.",
  tags: ["Companies"],
  request: {
    params: z.object({ domain: z.string().openapi({ example: "acme.com" }) }),
  },
  responses: {
    200: {
      description: "Enriched company details",
      content: { "application/json": { schema: CompanyFirmographicsSchema } },
    },
    404: {
      description: "Company not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/companies/discovery",
  summary: "Search company discovery",
  description: "Search lightweight company discovery data from Clay find-companies.",
  tags: ["Companies"],
  request: {
    query: PaginationQuerySchema.merge(CompanyDiscoverySearchQuerySchema),
  },
  responses: {
    200: {
      description: "List of discovery companies",
      content: {
        "application/json": {
          schema: paginatedResponse(CompanyDiscoverySchema, "CompanyDiscoveryList"),
        },
      },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/companies/discovery/{domain}",
  summary: "Get discovery company by domain",
  description: "Get a single discovery company record by domain.",
  tags: ["Companies"],
  request: {
    params: z.object({ domain: z.string().openapi({ example: "acme.com" }) }),
  },
  responses: {
    200: {
      description: "Discovery company details",
      content: { "application/json": { schema: CompanyDiscoverySchema } },
    },
    404: {
      description: "Company not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

// ============================================================
// People Endpoints
// ============================================================

registry.registerPath({
  method: "get",
  path: "/api/people",
  summary: "List canonical people",
  description: "List canonical person records from core.people.",
  tags: ["People"],
  request: {
    query: PaginationQuerySchema.merge(CorePersonSearchQuerySchema),
  },
  responses: {
    200: {
      description: "List of canonical people",
      content: {
        "application/json": {
          schema: paginatedResponse(CorePersonSchema, "CorePersonList"),
        },
      },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/people/background",
  summary: "Search person profiles",
  description: "Search and list enriched person profiles.",
  tags: ["People"],
  request: {
    query: PaginationQuerySchema.merge(PersonProfileSearchQuerySchema),
  },
  responses: {
    200: {
      description: "List of enriched people",
      content: {
        "application/json": {
          schema: paginatedResponse(PersonProfileSchema, "PersonProfileList"),
        },
      },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/people/background/{slug}",
  summary: "Get person by LinkedIn slug",
  description: "Get a person profile with experience and education.",
  tags: ["People"],
  request: {
    params: z.object({ slug: z.string().openapi({ example: "johndoe" }) }),
  },
  responses: {
    200: {
      description: "Person with details",
      content: { "application/json": { schema: PersonWithDetailsSchema } },
    },
    404: {
      description: "Person not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/people/background/{slug}/experience",
  summary: "Get person experience",
  description: "Get experience records for a person.",
  tags: ["People"],
  request: {
    params: z.object({ slug: z.string().openapi({ example: "johndoe" }) }),
  },
  responses: {
    200: {
      description: "List of experience records",
      content: {
        "application/json": {
          schema: z.array(PersonExperienceSchema).openapi("PersonExperienceList"),
        },
      },
    },
    404: {
      description: "Person not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/people/background/{slug}/education",
  summary: "Get person education",
  description: "Get education records for a person.",
  tags: ["People"],
  request: {
    params: z.object({ slug: z.string().openapi({ example: "johndoe" }) }),
  },
  responses: {
    200: {
      description: "List of education records",
      content: {
        "application/json": {
          schema: z.array(PersonEducationSchema).openapi("PersonEducationList"),
        },
      },
    },
    404: {
      description: "Person not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/people/discovery",
  summary: "Search person discovery",
  description: "Search lightweight person discovery data from Clay find-people.",
  tags: ["People"],
  request: {
    query: PaginationQuerySchema.merge(PersonDiscoverySearchQuerySchema),
  },
  responses: {
    200: {
      description: "List of discovery people",
      content: {
        "application/json": {
          schema: paginatedResponse(PersonDiscoverySchema, "PersonDiscoveryList"),
        },
      },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/people/discovery/{slug}",
  summary: "Get discovery person by slug",
  description: "Get a single discovery person record by LinkedIn slug.",
  tags: ["People"],
  request: {
    params: z.object({ slug: z.string().openapi({ example: "johndoe" }) }),
  },
  responses: {
    200: {
      description: "Discovery person details",
      content: { "application/json": { schema: PersonDiscoverySchema } },
    },
    404: {
      description: "Person not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/people/by-past-company",
  summary: "Find people by past company",
  description: "Find people who previously worked at a specific company.",
  tags: ["People"],
  request: {
    query: PaginationQuerySchema.merge(ByPastCompanyQuerySchema),
  },
  responses: {
    200: {
      description: "List of people with past experience at company",
      content: {
        "application/json": {
          schema: paginatedResponse(PersonWithPastExperienceSchema, "PersonWithPastExperienceList"),
        },
      },
    },
    400: {
      description: "Validation error or missing required parameter",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

// ============================================================
// Workflows Endpoints
// ============================================================

registry.registerPath({
  method: "get",
  path: "/api/workflows",
  summary: "List workflows",
  description: "List enrichment workflow definitions.",
  tags: ["Workflows"],
  request: {
    query: WorkflowSearchQuerySchema,
  },
  responses: {
    200: {
      description: "List of workflows",
      content: {
        "application/json": {
          schema: z.array(WorkflowSchema).openapi("WorkflowList"),
        },
      },
    },
    400: {
      description: "Validation error",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/workflows/{slug}",
  summary: "Get workflow by slug",
  description: "Get a single workflow by its slug.",
  tags: ["Workflows"],
  request: {
    params: z.object({ slug: z.string().openapi({ example: "clay-company-firmographics" }) }),
  },
  responses: {
    200: {
      description: "Workflow details",
      content: { "application/json": { schema: WorkflowSchema } },
    },
    404: {
      description: "Workflow not found",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

// ============================================================
// Leads Endpoints
// ============================================================

registry.registerPath({
  method: "get",
  path: "/api/leads/{slug}",
  summary: "Get leads for a company",
  description: "Get leads (people) matching a company's ICP criteria. Use the company slug (e.g., 'ramp', 'mutiny', 'vanta').",
  tags: ["Leads"],
  request: {
    params: z.object({ slug: z.string().openapi({ example: "ramp" }) }),
  },
  responses: {
    200: {
      description: "Leads matching ICP",
      content: { "application/json": { schema: LeadsResponseSchema } },
    },
    404: {
      description: "ICP not found for slug",
      content: { "application/json": { schema: ErrorResponseSchema } },
    },
  },
});

// ============================================================
// Generate OpenAPI Document
// ============================================================

export function generateOpenAPIDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: "3.0.3",
    info: {
      title: "HQ Database API",
      version: "1.0.0",
      description:
        "Central API layer for accessing the HQ Master Data Warehouse. " +
        "Provides read-only access to company firmographics, person profiles, " +
        "experience, education, and discovery data.",
    },
    servers: [
      { url: "http://localhost:3000", description: "Local development" },
    ],
    tags: [
      { name: "Companies", description: "Company firmographics and discovery data" },
      { name: "People", description: "Person profiles, experience, and education" },
      { name: "Workflows", description: "Enrichment workflow definitions" },
      { name: "Leads", description: "ICP-matched leads for prospecting" },
    ],
  });
}

