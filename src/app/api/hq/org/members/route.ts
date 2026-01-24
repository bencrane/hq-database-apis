// TODO: Add auth middleware
import { NextRequest, NextResponse } from "next/server";
import { getHqCoreDb } from "@/lib/supabase/server";
import { parseQueryParams } from "@/lib/api/response";
import { OrgIdQuerySchema } from "@/lib/api/hq/schemas";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function corsJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/**
 * GET /api/hq/org/members?org_id={orgId}
 * List members of an organization.
 */
export async function GET(request: NextRequest) {
  try {
    const params = parseQueryParams(request.nextUrl.searchParams);
    const result = OrgIdQuerySchema.safeParse(params);

    if (!result.success) {
      return corsJson(
        { error: { code: "VALIDATION_ERROR", message: "Invalid parameters", details: result.error.issues } },
        400
      );
    }

    const { org_id } = result.data;

    const { data, error } = await getHqCoreDb()
      .from("org_users")
      .select("user_id, role, created_at")
      .eq("org_id", org_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return corsJson({ data: data ?? [] });
  } catch (error) {
    console.error("GET /api/hq/org/members error:", error);
    const err = error as { message?: string };
    return corsJson(
      { error: { code: "INTERNAL_ERROR", message: err.message || "An unexpected error occurred" } },
      500
    );
  }
}
