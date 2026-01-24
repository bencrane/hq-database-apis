// TODO: Add auth middleware to verify org access
import { NextRequest } from "next/server";
import { hqCoreDb, hqAccountsDb } from "@/lib/supabase/server";
import {
  paginatedResponse,
  jsonResponse,
  notFoundResponse,
  validationErrorResponse,
  serverErrorResponse,
  parseQueryParams,
} from "@/lib/api/response";
import { PaginationSchema, AddEmailAccountSchema } from "@/lib/api/hq/schemas";

interface RouteParams {
  params: Promise<{ org_id: string }>;
}

async function verifyOrgExists(org_id: string): Promise<boolean> {
  const { data, error } = await hqCoreDb
    .from("orgs")
    .select("id")
    .eq("id", org_id)
    .single();
  return !error && !!data;
}

/**
 * GET /api/hq/orgs/[org_id]/accounts/email
 * List email accounts for organization.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { org_id } = await params;

    if (!(await verifyOrgExists(org_id))) {
      return notFoundResponse("Organization");
    }

    const queryParams = parseQueryParams(request.nextUrl.searchParams);
    const result = PaginationSchema.safeParse(queryParams);

    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    const { limit, offset } = result.data;

    const { data, error, count } = await hqAccountsDb
      .from("email_accounts")
      .select("id, org_id, email, provider, smartlead_account_id, created_at, updated_at", {
        count: "exact",
      })
      .eq("org_id", org_id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return paginatedResponse(data ?? [], {
      total: count ?? 0,
      limit,
      offset,
      hasMore: (count ?? 0) > offset + limit,
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

/**
 * POST /api/hq/orgs/[org_id]/accounts/email
 * Add email account to organization.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { org_id } = await params;

    if (!(await verifyOrgExists(org_id))) {
      return notFoundResponse("Organization");
    }

    const body = await request.json();
    const result = AddEmailAccountSchema.safeParse(body);

    if (!result.success) {
      return validationErrorResponse(result.error);
    }

    const { email, provider, credentials_encrypted, smartlead_account_id } =
      result.data;

    const insertData: Record<string, unknown> = {
      org_id,
      email,
      provider,
    };
    if (credentials_encrypted !== undefined) {
      insertData.credentials_encrypted = credentials_encrypted;
    }
    if (smartlead_account_id !== undefined) {
      insertData.smartlead_account_id = smartlead_account_id;
    }

    const { data, error } = await hqAccountsDb
      .from("email_accounts")
      .insert(insertData)
      .select("id, org_id, email, provider, smartlead_account_id, created_at, updated_at")
      .single();

    if (error) {
      if (error.code === "23505") {
        return jsonResponse(
          {
            error: {
              code: "CONFLICT",
              message: "This email account already exists in the organization",
            },
          },
          409
        );
      }
      throw error;
    }

    return jsonResponse(data, 201);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
