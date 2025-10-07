import React, { useEffect, useState, useRef, useCallback } from "react";
import grapesjs, { Editor } from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import {
  Pencil,
  Eye,
  Download,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from "lucide-react";
import "./HTMLEditor.css";

interface HTMLEditorProps {
  initialHtml?: string;
  pageTitle?: string;
}

const HTMLEditor: React.FC<HTMLEditorProps> = ({
  initialHtml = "",
  pageTitle = "html",
}) => {
  // ## 1. State and Refs Management (Không thay đổi)
  // ---------------------------------
  const [mode, setMode] = useState<"edit" | "view">("view");
  const [htmlContent, setHtmlContent] = useState<string>(initialHtml);
  const [isTextToolbarActive, setTextToolbarActive] = useState(false);

  const grapesjsEditorRef = useRef<Editor | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // ## 2. GrapesJS Initialization and Cleanup (Không thay đổi)
  // ------------------------------------------
  useEffect(() => {
    if (grapesjsEditorRef.current || !editorContainerRef.current) {
      return;
    }
    const editor = grapesjs.init({
      container: editorContainerRef.current,
      storageManager: false,
      panels: { defaults: [] },
      showOffsets: false,
      noticeOnUnload: false,
    });

    if (initialHtml) {
      editor.setComponents(initialHtml);
    }

    grapesjsEditorRef.current = editor;

    const handleComponentSelect = (model: any) =>
      setTextToolbarActive(!!model.get("editable"));
    const handleComponentDeselect = () => setTextToolbarActive(false);

    editor.on("component:select", handleComponentSelect);
    editor.on("component:deselect", handleComponentDeselect);

    return () => {
      editor.off("component:select", handleComponentSelect);
      editor.off("component:deselect", handleComponentDeselect);
      grapesjsEditorRef.current?.destroy();
      grapesjsEditorRef.current = null;
    };
  }, []);

  // ## 3. Helper Functions (Không thay đổi)
  // -----------------------
  const getFullHtml = useCallback(() => {
    const editor = grapesjsEditorRef.current;
    if (!editor) return "";
    const html = editor.getHtml();
    const css = editor.getCss();
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${pageTitle}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${css}</style>
</head>
<body>${html}</body>
</html>`;
  }, [pageTitle]);

  // ## 4. Event Handlers (Không thay đổi)
  // ---------------------
  const switchToView = useCallback(() => {
    if (mode === "edit") {
      const currentHtml = getFullHtml();
      setHtmlContent(currentHtml);
    }
    setMode("view");
    setTextToolbarActive(false);
  }, [getFullHtml, mode]);

  const switchToEdit = () => setMode("edit");

  const saveHtml = useCallback(() => {
    const fullHtml = getFullHtml();
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pageTitle
      .toLowerCase()
      .replace(/\s/g, "-")}-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  }, [getFullHtml, pageTitle]);

  const applyRichTextCommand = (command: string) => {
    const editor = grapesjsEditorRef.current;
    if (editor) {
      editor.RichTextEditor.run(command);
      editor.trigger("change:canvasOffset");
    }
  };

  // ## 5. Render Logic (PHẦN NÀY ĐÃ ĐƯỢC CẬP NHẬT)
  // -------------------
  const renderTextFormattingToolbar = () => (
    // CHANGED: Thêm border-t để tách biệt rõ hơn với thanh toolbar chính
    <div className="bg-white border-b border-t border-gray-200 px-3 py-1 flex gap-1 items-center">
      {[
        { cmd: "bold", title: "Bold", icon: <Bold size={18} /> },
        { cmd: "italic", title: "Italic", icon: <Italic size={18} /> },
        { cmd: "underline", title: "Underline", icon: <Underline size={18} /> },
        {
          cmd: "strikeThrough",
          title: "Strike",
          icon: <Strikethrough size={18} />,
        },
      ].map(({ cmd, title, icon }) => (
        <button
          key={cmd}
          title={title}
          disabled={!isTextToolbarActive}
          // CHANGED: Cập nhật style cho các nút text format
          className={`p-1.5 rounded-md text-gray-500 transition-colors
                      hover:bg-slate-100 hover:text-gray-800
                      disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed`}
          onMouseDown={(e) => {
            e.preventDefault();
            applyRichTextCommand(cmd);
          }}
        >
          {icon}
        </button>
      ))}
      {/* CHANGED: Màu dải phân cách nhạt hơn */}
      <div className="w-px h-5 bg-slate-200 mx-2"></div>
      {[
        {
          cmd: "justifyLeft",
          title: "Align Left",
          icon: <AlignLeft size={18} />,
        },
        {
          cmd: "justifyCenter",
          title: "Align Center",
          icon: <AlignCenter size={18} />,
        },
        {
          cmd: "justifyRight",
          title: "Align Right",
          icon: <AlignRight size={18} />,
        },
        {
          cmd: "justifyFull",
          title: "Justify",
          icon: <AlignJustify size={18} />,
        },
      ].map(({ cmd, title, icon }) => (
        <button
          key={cmd}
          title={title}
          disabled={!isTextToolbarActive}
          // CHANGED: Cập nhật style cho các nút text format (giống như trên)
          className={`p-1.5 rounded-md text-gray-500 transition-colors
                      hover:bg-slate-100 hover:text-gray-800
                      disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed`}
          onMouseDown={(e) => {
            e.preventDefault();
            applyRichTextCommand(cmd);
          }}
        >
          {icon}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col w-[1300px] h-[90vh] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
      {/* CHANGED: Cập nhật style cho toolbar chính */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex justify-between items-center">
        <div className="font-semibold text-gray-700">{pageTitle}</div>
        <div className="flex items-center gap-4">
          {/* CHANGED: Cập nhật style cho nút chuyển mode */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              title="Edit Mode"
              onClick={switchToEdit}
              className={`p-1.5 rounded-md transition-all duration-200 ${
                mode === "edit"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:bg-slate-200/70 hover:text-gray-700"
              }`}
            >
              <Pencil size={18} />
            </button>
            <button
              title="View Mode"
              onClick={switchToView}
              className={`p-1.5 rounded-md transition-all duration-200 ${
                mode === "view"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:bg-slate-200/70 hover:text-gray-700"
              }`}
            >
              <Eye size={18} />
            </button>
          </div>
          {/* CHANGED: Màu dải phân cách nhạt hơn */}
          <div className="w-px h-6 bg-slate-200"></div>
          {/* CHANGED: Cập nhật style cho nút Download */}
          <button
            onClick={saveHtml}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                       transition-all duration-200 ease-in-out flex items-center gap-2 text-sm
                       font-semibold shadow-sm hover:shadow-md hover:-translate-y-px 
                       active:translate-y-0 active:shadow-sm"
          >
            <Download size={16} />
            <span>Download</span>
          </button>
        </div>
      </div>

      {mode === "edit" && renderTextFormattingToolbar()}

      {/* Content Area (Không thay đổi) */}
      <div className="flex-1 bg-gray-100 relative">
        <div
          ref={editorContainerRef}
          className={`w-full h-full ${mode !== "edit" ? "hidden" : ""}`}
        />
        <iframe
          className={`w-full h-full border-0 bg-white ${
            mode !== "view" ? "hidden" : ""
          }`}
          title="HTML Preview"
          sandbox="allow-scripts allow-same-origin"
          srcDoc={htmlContent}
        />
      </div>
    </div>
  );
};

export default HTMLEditor;
