"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type DocNode = {
  id: string;
  title: string;
  parentId?: string | null;
  children?: DocNode[];
};

async function fetchTree(): Promise<DocNode[]> {
  const res = await fetch("/api/documents", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load");
  return res.json();
}

export default function DocumentTree() {
  const pathname = usePathname();
  const router = useRouter();
  const currentId = pathname?.split("/").pop();
  const [tree, setTree] = useState<DocNode[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [error, setError] = useState("");

  const loadTree = useCallback(() => {
    setLoading(true);
    fetchTree()
      .then((t) => {
        setTree(t);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  useEffect(() => {
    (window as any).reloadDocumentTree = loadTree;
    return () => {
      delete (window as any).reloadDocumentTree;
    };
  }, [loadTree]);

  const buildParentMap = (
    nodes: DocNode[],
    parent?: DocNode,
    map = new Map<string, string | null>()
  ) => {
    for (const n of nodes) {
      map.set(n.id, parent ? parent.id : null);
      if (n.children?.length) buildParentMap(n.children, n, map);
    }
    return map;
  };

  useEffect(() => {
    if (!currentId || tree.length === 0) return;
    const parentMap = buildParentMap(tree);
    const toExpand: Record<string, boolean> = {};
    let p = parentMap.get(currentId);
    while (p) {
      toExpand[p] = true;
      p = parentMap.get(p) || null;
    }

    const findNode = (nodes: DocNode[]): DocNode | null => {
      for (const n of nodes) {
        if (n.id === currentId) return n;
        if (n.children?.length) {
          const found = findNode(n.children);
          if (found) return found;
        }
      }
      return null;
    };

    const currentNode = findNode(tree);
    if (currentNode && currentNode.children?.length) {
      toExpand[currentNode.id] = true;
    }

    setExpanded((prev) => ({ ...prev, ...toExpand }));
  }, [currentId, tree]);

  const toggle = useCallback((id: string) => {
    setExpanded((s) => ({ ...s, [id]: !s[id] }));
  }, []);

  const createRootDoc = async () => {
    if (!newTitle.trim()) {
      setError("Vui lòng nhập tiêu đề");
      return;
    }

    setCreating(true);
    setError("");

    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle.trim(),
        content: "",
        parentId: null,
      }),
    });

    if (res.ok) {
      const newDoc = await res.json();
      setNewTitle("");
      loadTree();
      router.push(`/documents/${newDoc.id}`);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Không tạo được trang");
    }
    setCreating(false);
  };

  const renderNode = (node: DocNode, depth = 0) => {
    const hasChildren = (node.children?.length || 0) > 0;
    const isExpanded = !!expanded[node.id];
    const isCurrent = node.id === currentId;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 py-1.5 px-2 rounded transition-colors ${
            isCurrent ? "bg-blue-50 font-medium" : "hover:bg-gray-100"
          }`}
          style={{ paddingLeft: depth * 16 + 8 }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggle(node.id)}
              className="w-5 h-5 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded transition-colors"
            >
              {isExpanded ? "▾" : "▸"}
            </button>
          ) : (
            <span className="w-5" />
          )}
          <Link
            href={`/documents/${node.id}`}
            className="flex-1 truncate hover:underline text-gray-800"
          >
            {node.title}
          </Link>
        </div>

        {hasChildren && isExpanded && (
          <div>{node.children!.map((c) => renderNode(c, depth + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Tiêu đề trang mới..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") createRootDoc();
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
        />
        <button
          onClick={createRootDoc}
          disabled={creating || !newTitle.trim()}
          className="w-full px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {creating ? "Đang tạo..." : "+ Tạo trang mới"}
        </button>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>

      {loading ? (
        <div className="text-gray-500">Đang tải...</div>
      ) : tree.length === 0 ? (
        <div className="text-gray-500 text-sm">Chưa có trang nào</div>
      ) : (
        tree.map((n) => renderNode(n, 0))
      )}
    </div>
  );
}
