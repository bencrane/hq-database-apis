// TODO: Add auth middleware
import { NextRequest, NextResponse } from "next/server";
import { getHqCoreDb } from "@/lib/supabase/server";
import { InviteMemberSchema } from "@/lib/api/hq/schemas";
import crypto from "crypto";

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
 * POST /api/hq/org/invite
 * Invite a new member to an organization.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = InviteMemberSchema.safeParse(body);

    if (!result.success) {
      return corsJson(
        { error: { code: "VALIDATION_ERROR", message: "Invalid data", details: result.error.issues } },
        400
      );
    }

    const { org_id, email, role } = result.data;

    // Generate invite token
    const token = crypto.randomBytes(32).toString("hex");
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const { data, error } = await getHqCoreDb()
      .from("invites")
      .insert({
        org_id,
        email,
        role: role || "member",
        token,
        expires_at,
        status: "pending",
      })
      .select("id, org_id, email, role, expires_at, status, created_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return corsJson(
          { error: { code: "CONFLICT", message: "An invite for this email already exists" } },
          409
        );
      }
      throw error;
    }

    // TODO: Send invite email with token

    return corsJson(data, 201);
  } catch (error) {
    console.error("POST /api/hq/org/invite error:", error);
    const err = error as { message?: string };
    return corsJson(
      { error: { code: "INTERNAL_ERROR", message: err.message || "An unexpected error occurred" } },
      500
    );
  }
}
