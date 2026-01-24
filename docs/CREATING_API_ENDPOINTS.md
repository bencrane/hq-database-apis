# Creating API Endpoints

This document describes the canonical process for creating API endpoints in this project.

---

## CRITICAL: CORS is Required

**Every endpoint called by a frontend MUST have CORS enabled.** Without CORS headers, browser requests from different origins will fail.

This is non-negotiable. If the endpoint will be called from a browser, add CORS.

---

## Overview

This project uses Next.js App Router with Supabase as the database. All API routes follow a consistent pattern for validation, error handling, CORS, and response formatting.

---

## Step 1: Add Database Client (if new database)

If connecting to a new Supabase project, add the client in `src/lib/supabase/server.ts`.

### Environment Variables

Add to `.env.local` and `.env.example`:

```bash
# .env.example
NEW_DB_SUPABASE_URL=https://your-project-ref.supabase.co
NEW_DB_SUPABASE_ANON_KEY=your-anon-key
NEW_DB_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Client Setup

```typescript
// src/lib/supabase/server.ts

const newDbUrl = process.env.NEW_DB_SUPABASE_URL;
const newDbKey = process.env.NEW_DB_SUPABASE_SERVICE_ROLE_KEY;

function getNewDbClient(schema: "public" | "custom_schema") {
  if (!newDbUrl || !newDbKey) {
    throw new Error("Missing NEW_DB_SUPABASE_URL or NEW_DB_SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(newDbUrl, newDbKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema,
    },
  });
}

export const newDbPublic = getNewDbClient("public");
export const newDbCustom = getNewDbClient("custom_schema");
```

---

## Step 2: Create Validation Schemas

Create Zod schemas in `src/lib/api/{feature}/schemas.ts`.

```typescript
// src/lib/api/example/schemas.ts
import { z } from "zod";

// Pagination (reusable)
export const PaginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

// Create schema
export const CreateExampleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
});

// Update schema (all fields optional)
export const UpdateExampleSchema = z.object({
  name: z.string().min(1).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});
```

---

## Step 3: Create Route Files

Routes go in `src/app/api/{path}/route.ts`.

### File Structure

```
src/app/api/
├── {resource}/
│   ├── route.ts              # GET list, POST create
│   └── [id]/
│       └── route.ts          # GET single, PATCH update, DELETE
```

### CORS Setup (Required for Frontend-Facing Endpoints)

Every route file that will be called from a frontend **must** include:

1. CORS headers constant
2. `corsJson` helper function
3. `OPTIONS` handler for preflight requests
4. Use `corsJson` instead of `jsonResponse` for all responses

```typescript
import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function corsJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
```

### Route Template (with CORS)

```typescript
// src/app/api/example/route.ts

// TODO: Add auth middleware
import { NextRequest, NextResponse } from "next/server";
import { exampleDb } from "@/lib/supabase/server";
import { parseQueryParams } from "@/lib/api/response";
import { PaginationSchema, CreateExampleSchema } from "@/lib/api/example/schemas";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function corsJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/**
 * GET /api/example
 * List all examples with pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const params = parseQueryParams(request.nextUrl.searchParams);
    const result = PaginationSchema.safeParse(params);

    if (!result.success) {
      return corsJson(
        { error: { code: "VALIDATION_ERROR", message: "Invalid parameters", details: result.error.issues } },
        400
      );
    }

    const { limit, offset } = result.data;

    const { data, error, count } = await exampleDb
      .from("examples")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return corsJson({
      data: data ?? [],
      pagination: {
        total: count ?? 0,
        limit,
        offset,
        hasMore: (count ?? 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error("GET /api/example error:", error);
    return corsJson({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, 500);
  }
}

/**
 * POST /api/example
 * Create a new example.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = CreateExampleSchema.safeParse(body);

    if (!result.success) {
      return corsJson(
        { error: { code: "VALIDATION_ERROR", message: "Invalid data", details: result.error.issues } },
        400
      );
    }

    const { data, error } = await exampleDb
      .from("examples")
      .insert(result.data)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return corsJson({ error: { code: "CONFLICT", message: "Already exists" } }, 409);
      }
      throw error;
    }

    return corsJson(data, 201);
  } catch (error) {
    console.error("POST /api/example error:", error);
    return corsJson({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, 500);
  }
}
```

### Dynamic Route Template (with CORS)

```typescript
// src/app/api/example/[id]/route.ts

// TODO: Add auth middleware
import { NextRequest, NextResponse } from "next/server";
import { exampleDb } from "@/lib/supabase/server";
import { UpdateExampleSchema } from "@/lib/api/example/schemas";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function corsJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/example/[id]
 * Get example by ID.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { data, error } = await exampleDb
      .from("examples")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return corsJson({ error: { code: "NOT_FOUND", message: "Example not found" } }, 404);
      }
      throw error;
    }

    return corsJson(data);
  } catch (error) {
    console.error("GET /api/example/[id] error:", error);
    return corsJson({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, 500);
  }
}

/**
 * PATCH /api/example/[id]
 * Update example.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = UpdateExampleSchema.safeParse(body);

    if (!result.success) {
      return corsJson(
        { error: { code: "VALIDATION_ERROR", message: "Invalid data", details: result.error.issues } },
        400
      );
    }

    // Check exists
    const { data: existing, error: checkError } = await exampleDb
      .from("examples")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError || !existing) {
      return corsJson({ error: { code: "NOT_FOUND", message: "Example not found" } }, 404);
    }

    const { data, error } = await exampleDb
      .from("examples")
      .update(result.data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return corsJson(data);
  } catch (error) {
    console.error("PATCH /api/example/[id] error:", error);
    return corsJson({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, 500);
  }
}

/**
 * DELETE /api/example/[id]
 * Delete example.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { data, error } = await exampleDb
      .from("examples")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return corsJson({ error: { code: "NOT_FOUND", message: "Example not found" } }, 404);
      }
      throw error;
    }

    return corsJson({ success: true, deleted: data });
  } catch (error) {
    console.error("DELETE /api/example/[id] error:", error);
    return corsJson({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, 500);
  }
}
```

---

## Response Helpers

Import from `@/lib/api/response`:

| Helper | Use Case |
|--------|----------|
| `paginatedResponse(data, pagination)` | List endpoints |
| `jsonResponse(data, status?)` | Single item or success |
| `notFoundResponse(resource)` | 404 errors |
| `validationErrorResponse(zodError)` | 400 validation errors |
| `badRequestResponse(message)` | 400 other errors |
| `serverErrorResponse(error)` | 500 errors |
| `parseQueryParams(searchParams)` | Convert URLSearchParams to object |

---

## Common Patterns

### Verify Parent Resource Exists

For nested routes, verify the parent exists before operations:

```typescript
async function verifyOrgExists(org_id: string): Promise<boolean> {
  const { data, error } = await db
    .from("orgs")
    .select("id")
    .eq("id", org_id)
    .single();
  return !error && !!data;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { org_id } = await params;

  if (!(await verifyOrgExists(org_id))) {
    return notFoundResponse("Organization");
  }

  // ... rest of handler
}
```

### Handle Unique Constraint Violations

```typescript
if (error.code === "23505") {
  return jsonResponse(
    { error: { code: "CONFLICT", message: "Already exists" } },
    409
  );
}
```

### Exclude Sensitive Fields from Response

Never return encrypted credentials in responses:

```typescript
// Explicit select, omitting sensitive fields
const { data } = await db
  .from("accounts")
  .select("id, org_id, email, provider, created_at, updated_at")
  .eq("org_id", org_id);
```

---

## Checklist

Before submitting:

- [ ] **CORS enabled** — `corsHeaders`, `corsJson`, and `OPTIONS` handler present
- [ ] **All responses use `corsJson`** — not `jsonResponse` or `NextResponse.json` directly
- [ ] TypeScript compiles (`npx tsc --noEmit`)
- [ ] All handlers have try/catch with error logging and `corsJson` error response
- [ ] Validation uses Zod schemas with `safeParse`
- [ ] Parent resources verified for nested routes
- [ ] Sensitive fields excluded from responses
- [ ] Auth middleware placeholder comment added
- [ ] JSDoc comment on each handler
- [ ] No placeholder code — all functions fully implemented
- [ ] **Vercel env vars configured** — all required env vars added to Vercel project settings

---

## Files Reference

| Purpose | Location |
|---------|----------|
| Supabase clients | `src/lib/supabase/server.ts` |
| Response helpers | `src/lib/api/response.ts` |
| Feature schemas | `src/lib/api/{feature}/schemas.ts` |
| Route handlers | `src/app/api/{path}/route.ts` |
