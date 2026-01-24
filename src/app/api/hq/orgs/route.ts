// TODO: Add auth middleware to verify admin access
import { NextRequest } from "next/server";
import { hqCoreDb } from "@/lib/supabase/server";
import {
  paginatedResponse,
  jsonResponse,
  validationErrorResponse,
  serverErrorResponse,
  parseQueryParams,
} from "@/lib/api/response";
import { PaginationSchema, CreateOrgSchema } from "@/lib/api/hq/schemas";

/**
 * GET /api/hq/orgs
 * List all organizations (admin use).
 */
export async function GET(request: NextRequest) {
  try {
    const params = parseQueryParams(request.nextUrl.searchParams);
    const result = PaginationSchema.safeParse(params);

    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    const { limit, offset } = result.data;

    const { data, error, count } = await hqCoreDb
      .from("orgs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return paginatedResponse(data ?? [], {
      total: count ?? 0,
      limit,
      offset,
      hasMore: (count ?? 0) > offset + limit,
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

/**
 * POST /api/hq/orgs
 * Create a new organization.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = CreateOrgSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    const { name, slug } = result.data;

    const { data, error } = await hqCoreDb
      .from("orgs")
      .insert({ name, slug })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return jsonResponse(
          {
            error: {
              code: "CONFLICT",
              message: "An organization with this slug already exists",
            },
          },
          409
        );
      }
      throw error;
    }

    return jsonResponse(data, 201);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
