import { NextRequest } from "next/server";
import { extractedDb } from "@/lib/supabase/server";
import {
  jsonResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api/response";
import { buildLinkedInUrl } from "@/lib/utils/linkedin";

type RouteContext = { params: Promise<{ slug: string }> };

/**
 * GET /api/people/{slug}
 * Get a single person profile with experience and education.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const linkedinUrl = buildLinkedInUrl(slug);

    // Get profile
    const { data: profile, error: profileError } = await extractedDb
      .from("person_profile")
      .select("*")
      .ilike("linkedin_url", `%/in/${slug}%`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (profileError) throw profileError;

    if (!profile) {
      return notFoundResponse("Person");
    }

    // Get experience
    const { data: experience, error: expError } = await extractedDb
      .from("person_experience")
      .select("*")
      .eq("linkedin_url", profile.linkedin_url)
      .order("experience_order", { ascending: true });

    if (expError) throw expError;

    // Get education
    const { data: education, error: eduError } = await extractedDb
      .from("person_education")
      .select("*")
      .eq("linkedin_url", profile.linkedin_url)
      .order("education_order", { ascending: true });

    if (eduError) throw eduError;

    return jsonResponse({
      ...profile,
      experience: experience ?? [],
      education: education ?? [],
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

