import { NextRequest, NextResponse } from "next/server";
import { verifyActivationToken } from "../../../../lib/email";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Activation token is required" },
        { status: 400 },
      );
    }

    const result = await verifyActivationToken(token);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Account verified successfully",
        user: {
          id: result.user?.id,
          email: result.user?.email,
          name: result.user?.name,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Verification API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
