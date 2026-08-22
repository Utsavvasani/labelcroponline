import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

interface ContactPayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

// Basic email regex validator
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body: ContactPayload = await request.json();

    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim() || "";
    const subject = body.subject?.trim() || "General Inquiry";
    const message = body.message?.trim();

    // ── Validation ──
    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid full name (minimum 2 characters)." },
        { status: 400 }
      );
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!message || message.length < 5) {
      return NextResponse.json(
        { success: false, error: "Please enter a message (minimum 5 characters)." },
        { status: 400 }
      );
    }

    // Capture client metadata for security & analytics
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // ── Save to MongoDB ──
    const { db } = await connectToDatabase();
    const contactsCollection = db.collection("contacts");

    const newContactDoc = {
      name,
      email,
      phone,
      subject,
      message,
      ip,
      userAgent,
      status: "new",
      createdAt: new Date(),
    };

    const insertResult = await contactsCollection.insertOne(newContactDoc);

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been received successfully!",
        id: insertResult.insertedId,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error storing contact message in MongoDB:", error);
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";

    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit message. Please try again or contact us directly via email.",
        details: process.env.NODE_ENV === "development" ? errorMsg : undefined,
      },
      { status: 500 }
    );
  }
}
