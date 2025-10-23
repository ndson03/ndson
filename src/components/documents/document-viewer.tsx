"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import DocumentForm from "./document-form";

export default function DocumentViewer({
  doc,
  onModeChange,
}: {
  doc: { id: string; title: string; content?: string };
  onModeChange: (mode: "view" | "edit" | "create") => void;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const reloadTree = () => {
    if (typeof window !== "undefined" && (window as any).reloadDocumentTree) {
      (window as any).reloadDocumentTree();
    }
  };

  const deleteDoc = async () => {
    if (
      !confirm(
        "Bạn có chắc muốn xóa trang này? Tất cả trang con cũng sẽ bị xóa."
      )
    )
      return;

    setDeleting(true);
    const res = await fetch(`/api/documents/${doc.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      reloadTree();
      router.push("/documents");
      router.refresh();
    } else {
      alert("Không thể xóa trang");
      setDeleting(false);
    }
  };

  return (
    <div className="h-full bg-white overflow-auto">
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">{doc.title}</h1>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onModeChange("edit")}
              className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Chỉnh sửa
            </button>
            <button
              onClick={() => onModeChange("create")}
              className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Tạo trang con
            </button>
            <button
              onClick={deleteDoc}
              disabled={deleting}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {deleting ? "Đang xóa..." : "Xóa"}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none whitespace-pre-wrap min-h-[400px] py-4">
          {doc.content || (
            <i className="text-gray-400">
              Trang rỗng — bấm chỉnh sửa để thêm nội dung.
            </i>
          )}
        </div>
      </div>
    </div>
  );
}
