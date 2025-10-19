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
            
            // Inline code
            if (!isBlock) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            
            // Code block
            return (
              <CodeBlock 
                code={codeContent} 
                language={match ? match[1] : "text"} 
              />
            );
          },
          
          pre({ children }) {
            // Bỏ qua pre wrapper vì CodeBlock đã xử lý
            return <>{children}</>;
          },
          
          p({ children }) {
            return <p>{children}</p>;
          },
          
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
          
          ul({ children }) {
            return <ul>{children}</ul>;
          },
          
          ol({ children }) {
            return <ol>{children}</ol>;
          },
          
          li({ children }) {
            return <li>{children}</li>;
          },
          
          h1({ children }) {
            return <h1>{children}</h1>;
          },
          
          h2({ children }) {
            return <h2>{children}</h2>;
          },
          
          h3({ children }) {
            return <h3>{children}</h3>;
          },
          
          h4({ children }) {
            return <h4>{children}</h4>;
          },
          
          h5({ children }) {
            return <h5>{children}</h5>;
          },
          
          h6({ children }) {
            return <h6>{children}</h6>;
          },
          
          blockquote({ children }) {
            return <blockquote>{children}</blockquote>;
          },
          
          table({ children }) {
            return <table>{children}</table>;
          },
          
          thead({ children }) {
            return <thead>{children}</thead>;
          },
          
          tbody({ children }) {
            return <tbody>{children}</tbody>;
          },
          
          tr({ children }) {
            return <tr>{children}</tr>;
          },
          
          td({ children }) {
            return <td>{children}</td>;
          },
          
          th({ children }) {
            return <th>{children}</th>;
          },
          
          strong({ children }) {
            return <strong>{children}</strong>;
          },
          
          em({ children }) {
            return <em>{children}</em>;
          },
          
          del({ children }) {
            return <del>{children}</del>;
          },
          
          img({ src, alt }) {
            return <img src={src} alt={alt} />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};