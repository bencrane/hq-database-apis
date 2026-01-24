// TODO: Add auth middleware
import { NextRequest, NextResponse } from "next/server";
import { getHqCoreDb } from "@/lib/supabase/server";
import { parseQueryParams } from "@/lib/api/response";
import { OrgIdQuerySchema, CreateAutomationSchema } from "@/lib/api/hq/schemas";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function corsJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/**
 * GET /api/hq/automations?org_id={orgId}
 * List automation rules for an organization.
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

    const { org_id, limit = 50, offset = 0 } = result.data;

    // Note: Using settings schema for automation_rules
    const { data, error, count } = await getHqCoreDb()
      .from("automation_rules")
      .select("*", { count: "exact" })
      .eq("org_id", org_id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return corsJson({
      data: data ?? [],
      pagination: {
        total: count ?? 0,
        limit,
        offset,
        hasMore: (count ?? 0) > offset + limit,
      },
    });
  } catch (error) {
    console.error("GET /api/hq/automations error:", error);
    const err = error as { message?: string; code?: string };
    return corsJson(
      { error: { code: "INTERNAL_ERROR", message: err.message || "An unexpected error occurred" } },
      500
    );
  }
}

/**
 * POST /api/hq/automations
 * Create a new automation rule.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = CreateAutomationSchema.safeParse(body);

    if (!result.success) {
      return corsJson(
        { error: { code: "VALIDATION_ERROR", message: "Invalid data", details: result.error.issues } },
        400
      );
    }

    const { data, error } = await getHqCoreDb()
      .from("automation_rules")
      .insert(result.data)
      .select()
      .single();

    if (error) throw error;

    return corsJson(data, 201);
  } catch (error) {
    console.error("POST /api/hq/automations error:", error);
    const err = error as { message?: string; code?: string };
    return corsJson(
      { error: { code: "INTERNAL_ERROR", message: err.message || "An unexpected error occurred" } },
      500
    );
  }
}
