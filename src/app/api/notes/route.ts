import { prisma } from "@/src/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Lấy tất cả notes
export async function GET() {
  try {
    const notes = await prisma.note.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(notes);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// POST - Tạo note mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const note = await prisma.note.create({
      data: { title, content },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
