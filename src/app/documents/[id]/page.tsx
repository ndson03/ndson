import DocumentEditor from "@/src/components/documents/document-editor";
import { prisma } from "@/src/lib/prisma";
import React from "react";

export const dynamic = "force-dynamic";

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const doc = await prisma.document.findUnique({
    where: { id },
  });

  if (!doc) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-red-600">
            Không tìm thấy tài liệu
          </h1>
        </div>
      </div>
    );
  }

  return (
    <DocumentEditor
      doc={{ id: doc.id, title: doc.title, content: doc.content ?? "" }}
    />
  );
}
