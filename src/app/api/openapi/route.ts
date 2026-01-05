import { NextResponse } from "next/server";
import { generateOpenAPIDocument } from "@/lib/openapi/registry";

/**
 * GET /api/openapi
 * Serve the OpenAPI specification.
 */
export async function GET() {
  const spec = generateOpenAPIDocument();
  return NextResponse.json(spec);
}

