import { prisma } from "@/src/lib/prisma";
import { NextResponse } from "next/server";

type Doc = {
  id: string;
  title: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  children?: Doc[];
};

function buildTree(items: Doc[]) {
  const map = new Map<string, Doc & { children: Doc[] }>();
  items.forEach((it) => map.set(it.id, { ...it, children: [] }));
  const roots: (Doc & { children: Doc[] })[] = [];
  for (const node of map.values()) {
    if (node.parentId) {
      const parent = map.get(node.parentId);
      if (parent) parent.children.push(node);
      else roots.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  const items = await prisma.document.findMany({
    select: {
      id: true,
      title: true,
      parentId: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const flat = items.map((d) => ({
    id: d.id,
    title: d.title,
    parentId: d.parentId,
  }));

  const tree = buildTree(flat as Doc[]);
  return NextResponse.json(tree);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { title = "Untitled", content = "", parentId = null } = body;

  const slug = createSlug(title);

  if (!slug) {
    return NextResponse.json(
      { error: "Tiêu đề không hợp lệ" },
      { status: 400 }
    );
  }

  const existing = await prisma.document.findUnique({
    where: { id: slug },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Tên trang đã tồn tại. Vui lòng chọn tên khác." },
      { status: 409 }
    );
  }

  if (parentId) {
    const parent = await prisma.document.findUnique({
      where: { id: parentId },
    });
    if (!parent) {
      return NextResponse.json(
        { error: "Trang cha không tồn tại" },
        { status: 400 }
      );
    }
  }

  const doc = await prisma.document.create({
    data: {
      id: slug,
      title,
      content,
      parentId,
    },
  });

  return NextResponse.json(doc, { status: 201 });
}
