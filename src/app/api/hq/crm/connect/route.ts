// TODO: Add auth middleware
import { NextRequest, NextResponse } from "next/server";
import { getHqAccountsDb } from "@/lib/supabase/server";
import { ConnectCRMSchema } from "@/lib/api/hq/schemas";

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
 * POST /api/hq/crm/connect
 * Connect a CRM to an organization.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = ConnectCRMSchema.safeParse(body);

    if (!result.success) {
      return corsJson(
        { error: { code: "VALIDATION_ERROR", message: "Invalid data", details: result.error.issues } },
        400
      );
    }

    const { data, error } = await getHqAccountsDb()
      .from("crm_connections")
      .insert({
        ...result.data,
        is_active: true,
      })
      .select("id, org_id, provider, instance_url, is_active, created_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return corsJson(
          { error: { code: "CONFLICT", message: "CRM connection already exists for this org and provider" } },
          409
        );
      }
      throw error;
    }

    return corsJson(data, 201);
  } catch (error) {
    console.error("POST /api/hq/crm/connect error:", error);
    const err = error as { message?: string };
    return corsJson(
      { error: { code: "INTERNAL_ERROR", message: err.message || "An unexpected error occurred" } },
      500
    );
  }
}
