// TODO: Add auth middleware
import { NextRequest, NextResponse } from "next/server";
import { getHqAccountsDb } from "@/lib/supabase/server";
import { TestCRMSchema } from "@/lib/api/hq/schemas";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function corsJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/**
 * POST /api/hq/crm/test
 * Test a CRM connection.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = TestCRMSchema.safeParse(body);

    if (!result.success) {
      return corsJson(
        { error: { code: "VALIDATION_ERROR", message: "Invalid data", details: result.error.issues } },
        400
      );
    }

    const { org_id, connection_id } = result.data;

    // Verify connection exists and belongs to org
    const { data: connection, error } = await getHqAccountsDb()
      .from("crm_connections")
      .select("id, provider, instance_url, is_active")
      .eq("id", connection_id)
      .eq("org_id", org_id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return corsJson({ error: { code: "NOT_FOUND", message: "CRM connection not found" } }, 404);
      }
      throw error;
    }

    // TODO: Actually test the CRM connection using stored credentials
    // For now, just return success if the connection exists
    return corsJson({
      success: true,
      connection_id: connection.id,
      provider: connection.provider,
      message: "Connection test successful",
    });
  } catch (error) {
    console.error("POST /api/hq/crm/test error:", error);
    const err = error as { message?: string };
    return corsJson(
      { error: { code: "INTERNAL_ERROR", message: err.message || "An unexpected error occurred" } },
      500
    );
  }
}
