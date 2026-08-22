import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_session_token")?.value;
  const { valid, email } = verifyAdminToken(token);

  if (!valid || !email) {
    return NextResponse.json(
      { success: false, authenticated: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    authenticated: true,
    user: {
      email,
      role: "admin",
    },
  });
}
