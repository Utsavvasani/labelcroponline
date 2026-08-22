import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import { checkAdminAuth } from "@/lib/adminAuth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access." },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid contact ID format." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const allowedStatuses = ["new", "read", "replied", "archived"];

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (body.status && allowedStatuses.includes(body.status)) {
      updateFields.status = body.status;
    }

    if (typeof body.notes === "string") {
      updateFields.adminNotes = body.notes.trim();
    }

    const { db } = await connectToDatabase();
    const result = await db.collection("contacts").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Contact submission not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Contact submission updated successfully.",
    });
  } catch (error: unknown) {
    console.error("Error updating contact submission:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update contact submission." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access." },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid contact ID format." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const result = await db.collection("contacts").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Contact submission not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Contact submission deleted successfully.",
    });
  } catch (error: unknown) {
    console.error("Error deleting contact submission:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete contact submission." },
      { status: 500 }
    );
  }
}
