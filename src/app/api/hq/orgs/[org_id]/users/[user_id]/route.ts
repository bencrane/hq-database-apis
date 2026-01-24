// TODO: Add auth middleware to verify org access
import { NextRequest } from "next/server";
import { getHqCoreDb } from "@/lib/supabase/server";
import {
  jsonResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api/response";

interface RouteParams {
  params: Promise<{ org_id: string; user_id: string }>;
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
 * DELETE /api/hq/orgs/[org_id]/users/[user_id]
 * Remove user from organization.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { org_id, user_id } = await params;

    if (!(await verifyOrgExists(org_id))) {
      return notFoundResponse("Organization");
    }

    const { data, error } = await getHqCoreDb()
      .from("org_users")
      .delete()
      .eq("org_id", org_id)
      .eq("user_id", user_id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return notFoundResponse("User in organization");
      }
      throw error;
    }

    return jsonResponse({ success: true, deleted: data });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
