// TODO: Add auth middleware to verify org access
import { NextRequest } from "next/server";
import { getHqCoreDb } from "@/lib/supabase/server";
import {
  jsonResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { UpdateOrgSchema } from "@/lib/api/hq/schemas";

interface RouteParams {
  params: Promise<{ org_id: string }>;
}

/**
 * GET /api/hq/orgs/[org_id]
 * Get organization by ID.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { org_id } = await params;

    const { data, error } = await getHqCoreDb()
      .from("orgs")
      .select("*")
      .eq("id", org_id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return notFoundResponse("Organization");
      }
      throw error;
    }

    return jsonResponse(data);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

/**
 * PATCH /api/hq/orgs/[org_id]
 * Update organization.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { org_id } = await params;
    const body = await request.json();
    const result = UpdateOrgSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    // Check org exists
    const { data: existingOrg, error: checkError } = await getHqCoreDb()
      .from("orgs")
      .select("id")
      .eq("id", org_id)
      .single();

    if (checkError || !existingOrg) {
      return notFoundResponse("Organization");
    }

    const updateData: Record<string, unknown> = {};
    if (result.data.name !== undefined) updateData.name = result.data.name;
    if (result.data.services_enabled !== undefined)
      updateData.services_enabled = result.data.services_enabled;
    if (result.data.status !== undefined) updateData.status = result.data.status;

    if (Object.keys(updateData).length === 0) {
      return jsonResponse(existingOrg);
    }

    const { data, error } = await getHqCoreDb()
      .from("orgs")
      .update(updateData)
      .eq("id", org_id)
      .select()
      .single();

    if (error) throw error;

    return jsonResponse(data);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
