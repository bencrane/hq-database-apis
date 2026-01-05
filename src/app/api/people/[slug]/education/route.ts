import { NextRequest } from "next/server";
import { extractedDb } from "@/lib/supabase/server";
import {
  jsonResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api/response";

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * GET /api/people/{slug}/education
 * Get education records for a person.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;

    // First find the profile to get the exact linkedin_url
    const { data: profile, error: profileError } = await extractedDb
      .from("person_profile")
      .select("linkedin_url")
      .ilike("linkedin_url", `%/in/${slug}%`)
      .limit(1)
      .maybeSingle();

    if (profileError) throw profileError;

    if (!profile) {
      return notFoundResponse("Person");
    }

    // Get education
    const { data: education, error } = await extractedDb
      .from("person_education")
      .select("*")
      .eq("linkedin_url", profile.linkedin_url)
      .order("education_order", { ascending: true });

    if (error) throw error;

    return jsonResponse(education ?? []);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

