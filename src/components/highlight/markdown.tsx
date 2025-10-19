import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./codeblock";

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeContent = String(children).replace(/\n$/, "");
            const isBlock = codeContent.includes('\n') || match;
            
            if (!isBlock) {
              return (
                <code 
                  className="bg-[#ececec] font-medium px-1.5 py-0.5 rounded"
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
            return <p className="my-2">{children}</p>;
          },
          
          a({ href, children }) {
            return (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#2964aa] underline decoration-dotted underline-offset-2"
              >
                {children}
              </a>
            );
          },
          
          ul({ children }) {
            return <ul className="list-disc ml-5 my-2.5">{children}</ul>;
          },
          
          ol({ children }) {
            return <ol className="list-decimal ml-5 my-2.5">{children}</ol>;
          },
          
          li({ children }) {
            return <li className="pl-1.5">{children}</li>;
          },
          
          h1({ children }) {
            return <h1 className="text-[2rem] font-bold mt-6 mb-4">{children}</h1>;
          },
          
          h2({ children }) {
            return <h2 className="text-[1.75rem] font-bold mt-5 mb-3">{children}</h2>;
          },
          
          h3({ children }) {
            return <h3 className="text-2xl font-semibold mt-4 mb-2">{children}</h3>;
          },
          
          h4({ children }) {
            return <h4 className="text-xl font-semibold mt-3 mb-2">{children}</h4>;
          },
          
          h5({ children }) {
            return <h5 className="text-lg font-medium mt-2 mb-1">{children}</h5>;
          },
          
          h6({ children }) {
            return <h6 className="text-base font-medium mt-2 mb-1 text-[#555]">{children}</h6>;
          },
          
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-700">
                {children}
              </blockquote>
            );
          },
          
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-gray-300">
                  {children}
                </table>
              </div>
            );
          },
          
          thead({ children }) {
            return <thead className="bg-gray-100">{children}</thead>;
          },
          
          tbody({ children }) {
            return <tbody>{children}</tbody>;
          },
          
          tr({ children }) {
            return <tr className="border-b border-gray-300">{children}</tr>;
          },
          
          td({ children }) {
            return <td className="border border-gray-300 px-4 py-2">{children}</td>;
          },
          
          th({ children }) {
            return <th className="border border-gray-300 px-4 py-2 font-semibold text-left">{children}</th>;
          },
          
          strong({ children }) {
            return <strong className="font-semibold">{children}</strong>;
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
                className="max-w-full h-auto rounded-lg my-4"
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};