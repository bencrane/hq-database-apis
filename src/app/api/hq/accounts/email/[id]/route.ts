// TODO: Add auth middleware
import { NextRequest, NextResponse } from "next/server";
import { getHqAccountsDb } from "@/lib/supabase/server";

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

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/hq/accounts/email/[id]
 * Delete an email account.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { data, error } = await getHqAccountsDb()
      .from("email_accounts")
      .delete()
      .eq("id", id)
      .select("id, email")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return corsJson({ error: { code: "NOT_FOUND", message: "Email account not found" } }, 404);
      }
      throw error;
    }

    return corsJson({ success: true, deleted: data });
  } catch (error) {
    console.error("DELETE /api/hq/accounts/email/[id] error:", error);
    const err = error as { message?: string };
    return corsJson(
      { error: { code: "INTERNAL_ERROR", message: err.message || "An unexpected error occurred" } },
      500
    );
  }
}
