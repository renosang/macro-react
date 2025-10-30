// src/pages/components/ContentViewer.tsx
import React from 'react';
import { Text, Descendant } from 'slate'; 
import { CustomElement, CustomText } from '../../types'; 

interface ContentViewerProps {
  content: Descendant[];
  highlight?: string;
}

const ContentViewer = ({ content, highlight }: ContentViewerProps) => {

  if (!Array.isArray(content)) {
    return <div className="content-viewer"><p>Nội dung không hợp lệ.</p></div>;
  }
  
  const serializeSimple = (nodes: Descendant[]): JSX.Element[] => {
     return nodes.map((node, i) => {
       if (Text.isText(node)) {
          const leaf = node as CustomText;
          const textSegments = leaf.text.split('\n').map((line, index) => (
            <React.Fragment key={index}>
              {index > 0 && <br />}
              {line}
            </React.Fragment>
          ));
          
          let el = <>{textSegments}</>;

          if (leaf.bold) el = <strong>{el}</strong>;
          if (leaf.italic) el = <em>{el}</em>;
          if (leaf.underline) el = <u>{el}</u>;
          if (leaf.black) el = <span style={{ color: 'black' }}>{el}</span>;
          if (leaf.color) el = <span style={{ color: leaf.color }}>{el}</span>;
          if (leaf.highlight) el = <mark>{el}</mark>;
          return <React.Fragment key={i}>{el}</React.Fragment>;
       }

       // Xử lý Element Node
       const el = node as CustomElement;
       const children = serializeSimple(el.children as Descendant[]);
       
       let style = {};
       if (el.type === 'paragraph' || el.type === 'bulleted-list' || el.type === 'numbered-list') {
         style = { textAlign: el.align };
       }

       switch (el.type) {
         case 'bulleted-list':
           return <ul key={i} style={style}>{children}</ul>;
         case 'numbered-list':
           return <ol key={i} style={style}>{children}</ol>;
         case 'list-item':
           return <li key={i}>{children}</li>;
         case 'image':
            return (
              <p style={style} key={i}> {/* Bọc ảnh trong <p> để tuân thủ align */}
                <img 
                  src={el.url} 
                  alt="Nội dung ảnh" 
                  style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '4px' }} 
                />
              </p>
            );
         case 'paragraph':
         default:
           return <p key={i} style={style}>{children}</p>;
       }
     });
  };

  return (
    <div className="content-viewer">
      {serializeSimple(content)}
    </div>
  );
};

export default ContentViewer;