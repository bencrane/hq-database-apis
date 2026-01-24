// TODO: Add auth middleware
import { NextRequest, NextResponse } from "next/server";
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
 * GET /api/hq/leads?org_id={orgId}
 * List leads for an organization.
 * Note: Leads data lives in a separate database - returns empty array for now.
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

    // TODO: Connect to leads database
    return corsJson({
      data: [],
      pagination: {
        total: 0,
        limit: result.data.limit || 50,
        offset: result.data.offset || 0,
        hasMore: false,
      },
    });
  } catch (error) {
    console.error("GET /api/hq/leads error:", error);
    return corsJson({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, 500);
  }
}
