import hljs from "highlight.js";
import { Copy, Check } from "lucide-react";
import { createRoot, Root } from "react-dom/client";
import React from "react";

export const copyCodeToClipboard = async (
  code: string,
  button: HTMLElement,
  root: Root
) => {
  try {
    await navigator.clipboard.writeText(code);
    root.render(React.createElement(React.Fragment, null, 
      React.createElement(Check, { size: 16 }), 
      " Đã sao chép"
    ));
    setTimeout(() => {
      root.render(React.createElement(React.Fragment, null,
        React.createElement(Copy, { size: 16 }),
        " Sao chép"
      ));
    }, 2000);
  } catch (err) {
    console.error("Failed to copy: ", err);
    alert("Không thể sao chép code!");
  }
};

export const detectLanguage = (codeElement: HTMLElement): string => {
  const classList = codeElement.className;
  const languageMatch = classList.match(/(?:language-|hljs-)([a-zA-Z0-9+#-]+)/);
  return languageMatch ? languageMatch[1] : "code";
};

export const addCopyButtonsToCodeBlocks = (container: HTMLElement) => {
  const codeBlocks = container.querySelectorAll("pre code:not(.processed)");

  codeBlocks.forEach((block) => {
    const pre = block.parentElement;
    if (pre && !pre.classList.contains("code-block-processed")) {
      pre.classList.add("code-block-processed");
      (block as HTMLElement).classList.add("processed");

      const language = detectLanguage(block as HTMLElement);

      const codeHeader = document.createElement("div");
      codeHeader.className = "code-header";

      const languageLabel = document.createElement("span");
      languageLabel.className = "language-label";
      languageLabel.textContent = language;

      const copyButton = document.createElement("button");
      copyButton.className = "copy-button";
      copyButton.title = "Sao chép code";

      // Create React root for the button content
      const root = createRoot(copyButton);
      root.render(React.createElement(React.Fragment, null,
        React.createElement(Copy, { size: 16 }),
        " Sao chép"
      ));

      copyButton.addEventListener("click", () => {
        const codeText = (block as HTMLElement).textContent || "";
        copyCodeToClipboard(codeText, copyButton, root);
      });

      codeHeader.appendChild(languageLabel);
      codeHeader.appendChild(copyButton);

      const wrapper = document.createElement("div");
      wrapper.className = "code-block-wrapper";

      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(codeHeader);
      wrapper.appendChild(pre);

      pre.style.margin = "0";
      pre.style.borderRadius = "0 0 8px 8px";
    }
  });
};

export const highlightCodeBlocks = (container: HTMLElement) => {
  const newCodeBlocks = container.querySelectorAll(
    "pre code:not(.highlighted)"
  );

  newCodeBlocks.forEach((block) => {
    hljs.highlightElement(block as HTMLElement);
    (block as HTMLElement).classList.add("highlighted");
  });

  addCopyButtonsToCodeBlocks(container);
};