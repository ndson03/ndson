import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

export const formatMessageContent = (content: string): string => {
  return DOMPurify.sanitize(marked(content) as string, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "strike",
      "code",
      "pre",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "a",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "td",
      "th",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class"],
  });
};

export const preserveWhitespace = (content: string): React.CSSProperties => ({
  whiteSpace: "pre-wrap",
  wordWrap: "break-word",
  fontFamily: "inherit",
});
