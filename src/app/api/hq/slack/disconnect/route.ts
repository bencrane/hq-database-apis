// TODO: Add auth middleware
import { NextRequest, NextResponse } from "next/server";
import { getHqAccountsDb } from "@/lib/supabase/server";
import { DisconnectSlackSchema } from "@/lib/api/hq/schemas";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function corsJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/**
 * DELETE /api/hq/slack/disconnect
 * Disconnect Slack from an organization.
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const result = DisconnectSlackSchema.safeParse(body);

    if (!result.success) {
      return corsJson(
        { error: { code: "VALIDATION_ERROR", message: "Invalid data", details: result.error.issues } },
        400
      );
    }

    const { org_id, connection_id } = result.data;

    const { data, error } = await getHqAccountsDb()
      .from("slack_connections")
      .delete()
      .eq("id", connection_id)
      .eq("org_id", org_id)
      .select("id, team_name")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return corsJson({ error: { code: "NOT_FOUND", message: "Slack connection not found" } }, 404);
      }
      throw error;
    }

    return corsJson({ success: true, deleted: data });
  } catch (error) {
    console.error("DELETE /api/hq/slack/disconnect error:", error);
    const err = error as { message?: string };
    return corsJson(
      { error: { code: "INTERNAL_ERROR", message: err.message || "An unexpected error occurred" } },
      500
    );
  }
}
