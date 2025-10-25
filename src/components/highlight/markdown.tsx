import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { CodeBlock } from "./codeblock";
import "katex/dist/katex.min.css";

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
}) => {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeContent = String(children).replace(/\n$/, "");
            const isBlock = codeContent.includes("\n") || match;

            if (!isBlock) {
              return (
                <code
                  className="bg-secondary/60 text-foreground font-medium px-1.5 py-0.5 rounded"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock
                code={codeContent}
                language={match ? match[1] : "text"}
              />
            );
          },

          pre({ children }) {
            return <>{children}</>;
          },

          p({ children }) {
            return <p className="my-2 text-foreground">{children}</p>;
          },

          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline decoration-dotted underline-offset-2 hover:text-blue-700 dark:hover:text-blue-300"
              >
                {children}
              </a>
            );
          },

          ul({ children }) {
            return (
              <ul className="list-disc ml-5 my-2.5 text-foreground">
                {children}
              </ul>
            );
          },

          ol({ children }) {
            return (
              <ol className="list-decimal ml-5 my-2.5 text-foreground">
                {children}
              </ol>
            );
          },

          li({ children }) {
            return <li className="pl-1.5">{children}</li>;
          },

          h1({ children }) {
            return (
              <h1 className="text-[2rem] font-bold mt-6 mb-4 text-foreground">
                {children}
              </h1>
            );
          },

          h2({ children }) {
            return (
              <h2 className="text-[1.75rem] font-bold mt-5 mb-3 text-foreground">
                {children}
              </h2>
            );
          },

          h3({ children }) {
            return (
              <h3 className="text-2xl font-semibold mt-4 mb-2 text-foreground">
                {children}
              </h3>
            );
          },

          h4({ children }) {
            return (
              <h4 className="text-xl font-semibold mt-3 mb-2 text-foreground">
                {children}
              </h4>
            );
          },

          h5({ children }) {
            return (
              <h5 className="text-lg font-medium mt-2 mb-1 text-foreground">
                {children}
              </h5>
            );
          },

          h6({ children }) {
            return (
              <h6 className="text-base font-medium mt-2 mb-1 text-muted-foreground">
                {children}
              </h6>
            );
          },

          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-border pl-4 my-4 italic text-muted-foreground">
                {children}
              </blockquote>
            );
          },

          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-border">
                  {children}
                </table>
              </div>
            );
          },

          thead({ children }) {
            return <thead className="bg-secondary">{children}</thead>;
          },

          tbody({ children }) {
            return <tbody>{children}</tbody>;
          },

          tr({ children }) {
            return <tr className="border-b border-border">{children}</tr>;
          },

          td({ children }) {
            return (
              <td className="border border-border px-4 py-2 text-foreground">
                {children}
              </td>
            );
          },

          th({ children }) {
            return (
              <th className="border border-border px-4 py-2 font-semibold text-left text-foreground">
                {children}
              </th>
            );
          },

          strong({ children }) {
            return (
              <strong className="font-semibold text-foreground">
                {children}
              </strong>
            );
          },

          em({ children }) {
            return <em className="italic">{children}</em>;
          },

          del({ children }) {
            return <del className="line-through">{children}</del>;
          },

          img({ src, alt }) {
            return (
              <img
                src={src}
                alt={alt}
                className="max-w-full h-auto rounded-lg my-4 border border-border"
              />
            );
          },

          hr() {
            return <hr className="my-3 border-t border-border" />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
