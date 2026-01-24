// TODO: Add auth middleware to verify user identity
import { NextRequest } from "next/server";
import { getHqCoreDb } from "@/lib/supabase/server";
import {
  jsonResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
  parseQueryParams,
} from "@/lib/api/response";
import { UserIdQuerySchema } from "@/lib/api/hq/schemas";

/**
 * GET /api/hq/me?user_id={user_id}
 * Look up user's org membership and return org details with user's role.
 */
export async function GET(request: NextRequest) {
  try {
    const params = parseQueryParams(request.nextUrl.searchParams);
    const result = UserIdQuerySchema.safeParse(params);

    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    const { user_id } = result.data;

    const { data, error } = await getHqCoreDb()
      .from("org_users")
      .select(
        `
        role,
        orgs:org_id (
          id,
          name,
          slug,
          services_enabled,
          status
        )
      `
      )
      .eq("user_id", user_id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return notFoundResponse("User not found in any organization");
      }
      throw error;
    }

    if (!data || !data.orgs) {
      return notFoundResponse("User not found in any organization");
    }

    return jsonResponse({
      org: data.orgs,
      role: data.role,
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
