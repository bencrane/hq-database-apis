// TODO: Add auth middleware
import { NextRequest, NextResponse } from "next/server";

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

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/hq/leads/[id]
 * Get a single lead by ID.
 * Note: Leads data lives in a separate database - returns 404 for now.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // TODO: Connect to leads database
    return corsJson(
      { error: { code: "NOT_FOUND", message: `Lead ${id} not found` } },
      404
    );
  } catch (error) {
    console.error("GET /api/hq/leads/[id] error:", error);
    return corsJson({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, 500);
  }
}
