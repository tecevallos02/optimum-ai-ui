import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    // Revalidate all sheet-related caches
    // Since we now scope by user session, we can revalidate all sheet data
    revalidateTag("sheets-calls");
    revalidateTag("sheets-kpis");
    revalidateTag("sheets-analytics");
    console.log("Revalidated all sheet caches");

    return NextResponse.json({
      success: true,
      message: "Revalidation triggered for all sheet data",
    });
  } catch (error) {
    console.error("Error processing sheet update webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 },
    );
  }
}
