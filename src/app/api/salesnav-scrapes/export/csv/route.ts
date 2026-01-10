import { NextRequest, NextResponse } from "next/server";
import { rawDb } from "@/lib/supabase/server";

const BATCH_SIZE = 24000;
const SUPABASE_CHUNK_SIZE = 1000; // Supabase default limit per query

/**
 * GET /api/salesnav-scrapes/export/csv?batch=0
 * Export Sales Navigator scrapes as CSV, 24k records per batch.
 * 
 * Query params:
 * - batch: batch number (0-indexed). Omit to get batch info.
 */
export async function GET(request: NextRequest) {
  try {
    const batchParam = request.nextUrl.searchParams.get("batch");

    // If no batch specified, return batch info
    if (batchParam === null) {
      const { count, error } = await rawDb
        .from("salesnav_scrapes")
        .select("*", { count: "exact", head: true });

      if (error) throw error;

      const totalRecords = count ?? 0;
      const totalBatches = Math.ceil(totalRecords / BATCH_SIZE);

      return NextResponse.json({
        totalRecords,
        batchSize: BATCH_SIZE,
        totalBatches,
        batches: Array.from({ length: totalBatches }, (_, i) => ({
          batch: i,
          start: i * BATCH_SIZE,
          end: Math.min((i + 1) * BATCH_SIZE - 1, totalRecords - 1),
          records: Math.min(BATCH_SIZE, totalRecords - i * BATCH_SIZE),
          url: `/api/salesnav-scrapes/export/csv?batch=${i}`,
        })),
      });
    }

    const batch = parseInt(batchParam, 10);
    if (isNaN(batch) || batch < 0) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Invalid batch number" } },
        { status: 400 }
      );
    }

    const batchOffset = batch * BATCH_SIZE;
    
    // Fetch in chunks of 1000 to work around Supabase limit
    const allData: Record<string, unknown>[] = [];
    const chunksToFetch = Math.ceil(BATCH_SIZE / SUPABASE_CHUNK_SIZE);
    
    for (let chunk = 0; chunk < chunksToFetch; chunk++) {
      const chunkOffset = batchOffset + chunk * SUPABASE_CHUNK_SIZE;
      
      const { data, error } = await rawDb
        .from("salesnav_scrapes")
        .select("*")
        .order("created_at", { ascending: true })
        .range(chunkOffset, chunkOffset + SUPABASE_CHUNK_SIZE - 1);

      if (error) throw error;
      
      if (!data || data.length === 0) break;
      
      allData.push(...data);
      
      // If we got fewer than chunk size, we've hit the end
      if (data.length < SUPABASE_CHUNK_SIZE) break;
    }

    if (allData.length === 0) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: `Batch ${batch} is empty or does not exist` } },
        { status: 404 }
      );
    }

    // Generate CSV
    const csv = generateCsv(allData);
    const filename = `salesnav_scrapes_batch_${batch}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("CSV export error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Export failed" } },
      { status: 500 }
    );
  }
}

function generateCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";

  const headers = Object.keys(rows[0]);
  const lines: string[] = [headers.join(",")];

  for (const row of rows) {
    const values = headers.map((h) => escapeCsvValue(row[h]));
    lines.push(values.join(","));
  }

  return lines.join("\n");
}

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  
  const str = typeof value === "object" ? JSON.stringify(value) : String(value);
  
  // Escape if contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}
