import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export function jsonResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function paginatedResponse<T>(
  data: T[],
  pagination: PaginationMeta,
  status = 200
) {
  return NextResponse.json({ data, pagination }, { status });
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: Record<string, unknown>
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details && { details }),
      },
    },
    { status }
  );
}

export function notFoundResponse(resource: string) {
  return errorResponse("NOT_FOUND", `${resource} not found`, 404);
}

export function validationErrorResponse(error: ZodError) {
  return errorResponse("VALIDATION_ERROR", "Invalid request data", 400, {
    issues: error.errors,
  });
}

export function badRequestResponse(message: string) {
  return errorResponse("BAD_REQUEST", message, 400);
}

export function serverErrorResponse(error: unknown) {
  console.error("Server error:", error);
  return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
}

export function parseQueryParams(searchParams: URLSearchParams) {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

