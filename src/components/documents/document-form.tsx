"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

type DocumentFormProps = {
  mode: "create" | "edit" | "create-child";
  initialData?: {
    id?: string;
    title: string;
    content: string;
    parentId?: string | null;
  };
  parentTitle?: string;
  onCancel: () => void;
  onSuccess?: () => void;
};

export default function DocumentForm({
  mode,
  initialData,
  parentTitle,
  onCancel,
  onSuccess,
}: DocumentFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reloadTree = () => {
    if (typeof window !== "undefined" && (window as any).reloadDocumentTree) {
      (window as any).reloadDocumentTree();
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Tiêu đề không được để trống");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (mode === "edit" && initialData?.id) {
        // Update existing document
        const res = await fetch(`/api/documents/${initialData.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim(), content }),
        });

        if (res.ok) {
          const data = await res.json();
          reloadTree();

          // If title changed, redirect to new URL
          if (data.oldId && data.id !== initialData.id) {
            router.push(`/documents/${data.id}`);
          }
          router.refresh();
          onSuccess?.();
        } else {
          const data = await res.json();
          setError(data.error || "Không thể lưu");
        }
      } else {
        // Create new document
        const res = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            content,
            parentId: initialData?.parentId || null,
          }),
        });

        if (res.ok) {
          const newDoc = await res.json();
          reloadTree();
          router.push(`/documents/${newDoc.id}`);
          router.refresh();
          onSuccess?.();
        } else {
          const data = await res.json();
          setError(data.error || "Không tạo được trang");
        }
      }
    } catch (err) {
      setError("Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const getTitle = () => {
    if (mode === "edit") return "Chỉnh sửa trang";
    if (mode === "create-child" && parentTitle)
      return `Tạo trang con của: ${parentTitle}`;
    return "Tạo trang mới";
  };

  return (
    <div className="h-full bg-white overflow-auto">
      <div className="max-w-5xl mx-auto p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề
            </label>
            <input
              type="text"
              placeholder="Nhập tiêu đề trang..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) handleSubmit();
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung
            </label>
            <textarea
              placeholder="Nhập nội dung trang..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-[calc(100vh-340px)] border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Nhấn{" "}
              <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 text-xs font-mono">
                Ctrl + Enter
              </kbd>{" "}
              để lưu nhanh
            </p>
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || !title.trim()}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
