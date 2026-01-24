// TODO: Add auth middleware to verify org access
import { NextRequest } from "next/server";
import { hqCoreDb, hqAccountsDb } from "@/lib/supabase/server";
import {
  jsonResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api/response";

interface RouteParams {
  params: Promise<{ org_id: string; account_id: string }>;
}

async function verifyOrgExists(org_id: string): Promise<boolean> {
  const { data, error } = await hqCoreDb
    .from("orgs")
    .select("id")
    .eq("id", org_id)
    .single();
  return !error && !!data;
}

/**
 * DELETE /api/hq/orgs/[org_id]/accounts/email/[account_id]
 * Delete email account from organization.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { org_id, account_id } = await params;

    if (!(await verifyOrgExists(org_id))) {
      return notFoundResponse("Organization");
    }

    const { data, error } = await hqAccountsDb
      .from("email_accounts")
      .delete()
      .eq("id", account_id)
      .eq("org_id", org_id)
      .select("id, org_id, email, provider, smartlead_account_id, created_at, updated_at")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return notFoundResponse("Email account");
      }
      throw error;
    }

    return jsonResponse({ success: true, deleted: data });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
