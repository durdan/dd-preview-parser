import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'text';
  
  if (inline) {
    return <code className={className} {...props}>{children}</code>;
  }
  
  return (
    <SyntaxHighlighter
      style={tomorrow}
      language={language}
      PreTag="div"
      customStyle={{
        margin: '1rem 0',
        borderRadius: '4px'
      }}
      {...props}
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  );
};

export default CodeBlock;