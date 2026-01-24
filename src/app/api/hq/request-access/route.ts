// TODO: Add rate limiting to prevent abuse
import { NextRequest, NextResponse } from "next/server";
import { getHqCoreDb } from "@/lib/supabase/server";
import { RequestAccessSchema } from "@/lib/api/hq/schemas";
import { randomUUID } from "crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function corsJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

/**
 * OPTIONS /api/hq/request-access
 * Handle CORS preflight requests.
 */
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/**
 * POST /api/hq/request-access
 * Request access to an organization based on email domain.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = RequestAccessSchema.safeParse(body);

    if (!result.success) {
      return corsJson(
        { error: { code: "VALIDATION_ERROR", message: "Invalid email", details: result.error.issues } },
        400
      );
    }

    const { email } = result.data;
    const domain = email.split("@")[1].toLowerCase();

    // Look up org by domain
    const { data: org, error: orgError } = await getHqCoreDb()
      .from("orgs")
      .select("id, name, slug")
      .eq("domain", domain)
      .single();

    if (orgError && orgError.code !== "PGRST116") {
      throw orgError;
    }

    // No matching org found
    if (!org) {
      return corsJson({
        status: "pending",
        message: "We'll review your request and be in touch",
      });
    }

    // Org found - check for existing pending invite
    const { data: existingInvite, error: inviteError } = await getHqCoreDb()
      .from("invites")
      .select("id, token, expires_at")
      .eq("org_id", org.id)
      .eq("email", email.toLowerCase())
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .single();

    if (inviteError && inviteError.code !== "PGRST116") {
      throw inviteError;
    }

    // Return existing valid invite
    if (existingInvite) {
      return corsJson({
        status: "approved",
        token: existingInvite.token,
        org_name: org.name,
      });
    }

    // Create new invite
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry

    const { data: newInvite, error: createError } = await getHqCoreDb()
      .from("invites")
      .insert({
        org_id: org.id,
        email: email.toLowerCase(),
        role: "member",
        token,
        status: "pending",
        expires_at: expiresAt.toISOString(),
      })
      .select("id, token")
      .single();

    if (createError) {
      throw createError;
    }

    return corsJson({
      status: "approved",
      token: newInvite.token,
      org_name: org.name,
    });
  } catch (error) {
    console.error("request-access error:", error);
    const err = error as { message?: string; code?: string; details?: string; hint?: string };
    return corsJson(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: err.message || "An unexpected error occurred",
          details: err.details || null,
          hint: err.hint || null,
          pgCode: err.code || null,
        }
      },
      500
    );
  }
}
