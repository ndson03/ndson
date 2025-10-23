import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { title, content } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const currentDoc = await prisma.document.findUnique({
    where: { id },
  });

  if (!currentDoc) {
    return NextResponse.json(
      { error: "Document không tồn tại" },
      { status: 404 }
    );
  }

  if (title && title !== currentDoc.title) {
    const newSlug = createSlug(title);

    if (!newSlug) {
      return NextResponse.json(
        { error: "Tiêu đề không hợp lệ" },
        { status: 400 }
      );
    }

    const existing = await prisma.document.findUnique({
      where: { id: newSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Tên trang đã tồn tại. Vui lòng chọn tên khác." },
        { status: 409 }
      );
    }

    const children = await prisma.document.findMany({
      where: { parentId: id },
    });

    const newDoc = await prisma.document.create({
      data: {
        id: newSlug,
        title,
        content: content ?? currentDoc.content,
        parentId: currentDoc.parentId,
      },
    });

    await prisma.document.updateMany({
      where: { parentId: id },
      data: { parentId: newSlug },
    });

    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ ...newDoc, oldId: id });
  }

  const doc = await prisma.document.update({
    where: { id },
    data: { content },
  });

  return NextResponse.json(doc);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Không thể xóa document" },
      { status: 500 }
    );
  }
}
