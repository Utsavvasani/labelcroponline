import { NextRequest, NextResponse } from "next/server";
import { createAdminToken } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const configuredEmail = process.env.ADMIN_EMAIL;
    const configuredPassword = process.env.ADMIN_PASSWORD;

    if (!configuredEmail || !configuredPassword) {
      return NextResponse.json(
        { success: false, error: "Admin credentials are not configured in environment variables." },
        { status: 500 }
      );
    }

    const cleanInputEmail = email?.trim().toLowerCase();
    const cleanConfigEmail = configuredEmail.trim().toLowerCase();

    // Constant-time like string comparison
    if (cleanInputEmail !== cleanConfigEmail || password !== configuredPassword) {
      // Artificial slight delay to prevent brute-force timing attacks
      await new Promise((resolve) => setTimeout(resolve, 400));
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = createAdminToken(cleanConfigEmail);

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful.",
      user: { email: cleanConfigEmail, role: "admin" },
    });

    // Set secure HTTP-only cookie for session management
    response.cookies.set({
      name: "admin_session_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return response;
  } catch (error: unknown) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
