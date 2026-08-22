import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { checkAdminAuth } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "all";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));
    const skip = (page - 1) * limit;

    const { db } = await connectToDatabase();
    const contactsCollection = db.collection("contacts");

    // Build query filter
    const query: Record<string, unknown> = {};

    if (status !== "all") {
      query.status = status;
    }

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { subject: searchRegex },
        { message: searchRegex },
      ];
    }

    // Get total count & paginated documents
    const total = await contactsCollection.countDocuments(query);
    const contacts = await contactsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get summary metrics for quick dashboard badges
    const statusCounts = await contactsCollection
      .aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const countsMap: Record<string, number> = {
      all: total,
      new: 0,
      read: 0,
      replied: 0,
      archived: 0,
    };

    statusCounts.forEach((item) => {
      if (item._id && typeof item._id === "string") {
        countsMap[item._id] = item.count;
      }
    });

    return NextResponse.json({
      success: true,
      data: contacts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      counts: countsMap,
    });
  } catch (error: unknown) {
    console.error("Admin contacts fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch contact submissions." },
      { status: 500 }
    );
  }
}
