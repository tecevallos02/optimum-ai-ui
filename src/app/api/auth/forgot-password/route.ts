import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createResetToken, sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        {
          message:
            "If an account with that email exists, we have sent a password reset link.",
        },
        { status: 200 },
      );
    }

    // Check if user has a password (not OAuth-only user)
    if (!user.password) {
      return NextResponse.json(
        {
          error:
            "This account uses social login. Please sign in with your social provider.",
        },
        { status: 400 },
      );
    }

    // Generate reset token
    const resetToken = await createResetToken(user.id);

    // Create reset URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    // Send reset email
    await sendPasswordResetEmail({
      email: user.email,
      name: user.name || user.firstName || "User",
      resetToken,
      resetUrl,
    });

    return NextResponse.json(
      {
        message:
          "If an account with that email exists, we have sent a password reset link.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Password reset request error:", error);

    // Check if it's a database connection error
    if (
      error instanceof Error &&
      error.message.includes("password authentication failed")
    ) {
      return NextResponse.json(
        {
          error:
            "Database connection issue. Please check your database configuration.",
        },
        { status: 500 },
      );
    }

    // Check if it's a Prisma field error (migration not run)
    if (
      error instanceof Error &&
      (error.message.includes("Unknown field") ||
        error.message.includes("resetToken"))
    ) {
      return NextResponse.json(
        {
          error:
            "Database schema needs to be updated. Please run: npx prisma db push",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 },
    );
  }
}
