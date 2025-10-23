"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function DocumentEditor({
  doc,
}: {
  doc: { id: string; title: string; content?: string };
}) {
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState(doc.title);
  const [content, setContent] = useState(doc.content ?? "");

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [error, setError] = useState("");

  const reloadTree = () => {
    if (typeof window !== "undefined" && (window as any).reloadDocumentTree) {
      (window as any).reloadDocumentTree();
    }
  };

  const save = async () => {
    if (!title.trim()) {
      setError("Tiêu đề không được để trống");
      return;
    }

    setSaving(true);
    setError("");

    const res = await fetch(`/api/documents/${doc.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), content }),
    });

    if (res.ok) {
      const data = await res.json();
      setEditing(false);
      reloadTree();

      // If title changed, redirect to new URL
      if (data.oldId && data.id !== doc.id) {
        router.push(`/documents/${data.id}`);
      }
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Không thể lưu");
    }
    setSaving(false);
  };

  const createChild = async () => {
    if (!newTitle.trim()) {
      setError("Tiêu đề không được để trống");
      return;
    }

    setSaving(true);
    setError("");

    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle.trim(),
        content: newContent,
        parentId: doc.id,
      }),
    });

    if (res.ok) {
      const newDoc = await res.json();
      reloadTree();
      router.push(`/documents/${newDoc.id}`);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Không tạo được trang con");
    }
    setSaving(false);
    setCreating(false);
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

  if (creating) {
    return (
      <div className="h-full bg-white">
        <div className="max-w-5xl mx-auto p-8">
          <h1 className="text-2xl font-bold mb-6">
            Tạo trang con của: {doc.title}
          </h1>

          <input
            placeholder="Tiêu đề trang..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-xl font-semibold mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <textarea
            placeholder="Nhập nội dung..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full h-[calc(100vh-280px)] border border-gray-300 rounded-lg p-4 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={createChild}
              disabled={saving || !newTitle.trim()}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
            <button
              onClick={() => {
                setCreating(false);
                setNewTitle("");
                setNewContent("");
                setError("");
              }}
              className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white">
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          {editing ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-3xl font-bold border border-gray-300 rounded-lg px-4 py-2 flex-1 mr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <h1 className="text-3xl font-bold">{title}</h1>
          )}

          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button
                  onClick={save}
                  disabled={saving || !title.trim()}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {saving ? "Đang lưu..." : "Lưu"}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setTitle(doc.title);
                    setContent(doc.content ?? "");
                    setError("");
                  }}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Hủy
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => setCreating(true)}
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
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Content */}
        {editing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-[calc(100vh-240px)] border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-base resize-none"
          />
        ) : (
          <div className="prose prose-lg max-w-none whitespace-pre-wrap min-h-[400px] py-4">
            {content || (
              <i className="text-gray-400">
                Trang rỗng — bấm chỉnh sửa để thêm nội dung.
              </i>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
