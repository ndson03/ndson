"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import TiptapEditor from "@/src/components/tiptap-editor/tiptap-editor";

export default function NoteEditorPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === "new";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) {
      fetchNote();
    }
  }, [params.id]);

  const fetchNote = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/notes/${params.id}`);
      if (response.ok) {
        const note = await response.json();
        setTitle(note.title);
        setContent(note.content);
      }
    } catch (error) {
      console.error("Failed to fetch note:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Vui lòng nhập tiêu đề và nội dung");
      return;
    }

    setSaving(true);
    try {
      const url = isNew ? "/api/notes" : `/api/notes/${params.id}`;
      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (response.ok) {
        const savedNote = await response.json();
        if (isNew) {
          router.push(`/notes/${savedNote.id}`);
        }
        alert("Lưu thành công!");
      }
    } catch (error) {
      console.error("Failed to save note:", error);
      alert("Lưu thất bại!");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa note này?")) return;

    try {
      const response = await fetch(`/api/notes/${params.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/notes");
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
      alert("Xóa thất bại!");
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto p-6">Đang tải...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {isNew ? "Tạo Note Mới" : "Chỉnh Sửa Note"}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/notes")}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Quay lại
          </button>
          {!isNew && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Xóa
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Tiêu đề</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Nội dung</label>
          <TiptapEditor content={content} onChange={setContent} />
        </div>
      </div>
    </div>
  );
}
