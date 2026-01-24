// TODO: Add auth middleware
import { NextRequest, NextResponse } from "next/server";
import { getHqAccountsDb } from "@/lib/supabase/server";
import { parseQueryParams } from "@/lib/api/response";
import { OrgIdQuerySchema, CreateLinkedInAccountSchema } from "@/lib/api/hq/schemas";

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
 * GET /api/hq/accounts/linkedin?org_id={orgId}
 * List LinkedIn accounts for an organization.
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

    const { data, error } = await getHqAccountsDb()
      .from("linkedin_accounts")
      .select("id, org_id, profile_url, display_name, is_active, created_at, updated_at")
      .eq("org_id", org_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return corsJson({ data: data ?? [] });
  } catch (error) {
    console.error("GET /api/hq/accounts/linkedin error:", error);
    const err = error as { message?: string };
    return corsJson(
      { error: { code: "INTERNAL_ERROR", message: err.message || "An unexpected error occurred" } },
      500
    );
  }
}

/**
 * POST /api/hq/accounts/linkedin
 * Create a new LinkedIn account.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = CreateLinkedInAccountSchema.safeParse(body);

    if (!result.success) {
      return corsJson(
        { error: { code: "VALIDATION_ERROR", message: "Invalid data", details: result.error.issues } },
        400
      );
    }

    const { data, error } = await getHqAccountsDb()
      .from("linkedin_accounts")
      .insert({
        ...result.data,
        is_active: true,
      })
      .select("id, org_id, profile_url, display_name, is_active, created_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return corsJson(
          { error: { code: "CONFLICT", message: "LinkedIn account already exists" } },
          409
        );
      }
      throw error;
    }

    return corsJson(data, 201);
  } catch (error) {
    console.error("POST /api/hq/accounts/linkedin error:", error);
    const err = error as { message?: string };
    return corsJson(
      { error: { code: "INTERNAL_ERROR", message: err.message || "An unexpected error occurred" } },
      500
    );
  }
}
