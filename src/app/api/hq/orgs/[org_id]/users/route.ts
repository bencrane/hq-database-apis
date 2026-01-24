// TODO: Add auth middleware to verify org access
import { NextRequest } from "next/server";
import { getHqCoreDb } from "@/lib/supabase/server";
import {
  paginatedResponse,
  jsonResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
  parseQueryParams,
} from "@/lib/api/response";
import { PaginationSchema, AddOrgUserSchema } from "@/lib/api/hq/schemas";

interface RouteParams {
  params: Promise<{ org_id: string }>;
}

async function verifyOrgExists(org_id: string): Promise<boolean> {
  const { data, error } = await getHqCoreDb()
    .from("orgs")
    .select("id")
    .eq("id", org_id)
    .single();
  return !error && !!data;
}

/**
 * GET /api/hq/orgs/[org_id]/users
 * List users in organization.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { org_id } = await params;

    if (!(await verifyOrgExists(org_id))) {
      return notFoundResponse("Organization");
    }

    const queryParams = parseQueryParams(request.nextUrl.searchParams);
    const result = PaginationSchema.safeParse(queryParams);

    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    const { limit, offset } = result.data;

    const { data, error, count } = await getHqCoreDb()
      .from("org_users")
      .select("*", { count: "exact" })
      .eq("org_id", org_id)
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
 * POST /api/hq/orgs/[org_id]/users
 * Add user to organization.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { org_id } = await params;

    if (!(await verifyOrgExists(org_id))) {
      return notFoundResponse("Organization");
    }

    const body = await request.json();
    const result = AddOrgUserSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    const { user_id, role } = result.data;

    const { data, error } = await getHqCoreDb()
      .from("org_users")
      .insert({ org_id, user_id, role })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return jsonResponse(
          {
            error: {
              code: "CONFLICT",
              message: "User is already a member of this organization",
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
