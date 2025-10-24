import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();

    // Test basic query
    const userCount = await prisma.user.count();

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      userCount,
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set",
    });
  } catch (error) {
    console.error("Database test error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set",
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
