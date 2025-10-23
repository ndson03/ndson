"use client";
import React, { useState, useRef } from "react";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import DocumentTree from "@/src/components/documents/document-tree";

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const allotmentRef = useRef<any>(null);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="h-screen overflow-hidden">
      <style jsx global>{`
        .sash-container {
          position: relative;
        }

        .sash {
          background: #e5e7eb !important;
          transition: background 0.2s;
        }

        .sash:hover {
          background: #60a5fa !important;
        }

        .sash-disabled {
          background: transparent !important;
        }

        /* Custom dots button on sash */
        .custom-sash-button {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 24px;
          height: 48px;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          opacity: 0;
          transition: opacity 0.2s;
          cursor: pointer;
          z-index: 100;
          pointer-events: auto;
        }

        .sash:hover .custom-sash-button {
          opacity: 1;
        }

        .custom-sash-button:hover {
          background: #f9fafb;
        }

        .sash-dot {
          width: 4px;
          height: 4px;
          background: #6b7280;
          border-radius: 50%;
        }
      `}</style>

      {isCollapsed ? (
        <div className="flex h-full">
          <div className="relative w-6 bg-gray-200 hover:bg-blue-400 flex-shrink-0 transition-colors">
            <button
              onClick={toggleSidebar}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-12 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 flex items-center justify-center transition-colors"
            >
              <span className="text-gray-600 text-sm">▶</span>
            </button>
          </div>
          <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
        </div>
      ) : (
        <Allotment ref={allotmentRef} defaultSizes={[200, 1000]}>
          <Allotment.Pane minSize={200} maxSize={800}>
            <aside className="h-full bg-white p-4 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Documents</h2>
              </div>
              <DocumentTree />
            </aside>
          </Allotment.Pane>

          <Allotment.Pane>
            <main className="h-full bg-gray-50 overflow-auto">{children}</main>
          </Allotment.Pane>
        </Allotment>
      )}

      {/* Custom sash button overlay */}
      {!isCollapsed && (
        <div
          className="fixed pointer-events-none"
          style={{
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            zIndex: 99,
          }}
        >
          <div
            className="custom-sash-button"
            onClick={toggleSidebar}
            style={{
              position: "fixed",
              left: "320px",
              pointerEvents: "auto",
            }}
          >
            <div className="sash-dot"></div>
            <div className="sash-dot"></div>
            <div className="sash-dot"></div>
          </div>
        </div>
      )}
    </div>
  );
}
