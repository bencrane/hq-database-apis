// TODO: Add auth middleware
import { NextRequest, NextResponse } from "next/server";
import { getHqCoreDb } from "@/lib/supabase/server";
import { UpdateAutomationSchema } from "@/lib/api/hq/schemas";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
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
 * GET /api/hq/automations/[id]
 * Get a single automation rule.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { data, error } = await getHqCoreDb()
      .from("automation_rules")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return corsJson({ error: { code: "NOT_FOUND", message: "Automation not found" } }, 404);
      }
      throw error;
    }

    return corsJson(data);
  } catch (error) {
    console.error("GET /api/hq/automations/[id] error:", error);
    return corsJson({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, 500);
  }
}

/**
 * PATCH /api/hq/automations/[id]
 * Update an automation rule.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = UpdateAutomationSchema.safeParse(body);

    if (!result.success) {
      return corsJson(
        { error: { code: "VALIDATION_ERROR", message: "Invalid data", details: result.error.issues } },
        400
      );
    }

    const { data, error } = await getHqCoreDb()
      .from("automation_rules")
      .update(result.data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return corsJson({ error: { code: "NOT_FOUND", message: "Automation not found" } }, 404);
      }
      throw error;
    }

    return corsJson(data);
  } catch (error) {
    console.error("PATCH /api/hq/automations/[id] error:", error);
    return corsJson({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, 500);
  }
}

/**
 * DELETE /api/hq/automations/[id]
 * Delete an automation rule.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { data, error } = await getHqCoreDb()
      .from("automation_rules")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return corsJson({ error: { code: "NOT_FOUND", message: "Automation not found" } }, 404);
      }
      throw error;
    }

    return corsJson({ success: true, deleted: data });
  } catch (error) {
    console.error("DELETE /api/hq/automations/[id] error:", error);
    return corsJson({ error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } }, 500);
  }
}
