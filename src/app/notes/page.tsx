"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function NotesListPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/notes");
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto p-6">Đang tải...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Danh Sách Notes</h1>
        <button
          onClick={() => router.push("/notes/new")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Tạo Note Mới
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl mb-4">Chưa có note nào</p>
          <button
            onClick={() => router.push("/notes/new")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Tạo note đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => router.push(`/notes/${note.id}`)}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer bg-white"
            >
              <h2 className="text-xl font-semibold mb-2 truncate">
                {note.title}
              </h2>
              <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                {stripHtml(note.content)}
              </p>
              <div className="text-xs text-gray-400">
                Cập nhật: {new Date(note.updatedAt).toLocaleString("vi-VN")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
