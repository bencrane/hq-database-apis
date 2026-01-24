// TODO: Add rate limiting to prevent abuse
import { NextRequest } from "next/server";
import { hqCoreDb } from "@/lib/supabase/server";
import {
  jsonResponse,
  validationErrorResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { RequestAccessSchema } from "@/lib/api/hq/schemas";
import { randomUUID } from "crypto";

/**
 * POST /api/hq/request-access
 * Request access to an organization based on email domain.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = RequestAccessSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    const { email } = result.data;
    const domain = email.split("@")[1].toLowerCase();

    // Look up org by domain
    const { data: org, error: orgError } = await hqCoreDb
      .from("orgs")
      .select("id, name, slug")
      .eq("domain", domain)
      .single();

    if (orgError && orgError.code !== "PGRST116") {
      throw orgError;
    }

    // No matching org found
    if (!org) {
      return jsonResponse({
        status: "pending",
        message: "We'll review your request and be in touch",
      });
    }

    // Org found - check for existing pending invite
    const { data: existingInvite, error: inviteError } = await hqCoreDb
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
      return jsonResponse({
        status: "approved",
        token: existingInvite.token,
        org_name: org.name,
      });
    }

    // Create new invite
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry

    const { data: newInvite, error: createError } = await hqCoreDb
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

    return jsonResponse({
      status: "approved",
      token: newInvite.token,
      org_name: org.name,
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
