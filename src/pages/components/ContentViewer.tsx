import React, { useMemo, useCallback } from 'react';
import { createEditor, Descendant, Text, Range, NodeEntry } from 'slate';
import { Slate, Editable, withReact, RenderLeafProps } from 'slate-react';

interface ContentViewerProps {
  content: Descendant[];
  highlight?: string;
}

const ContentViewer = ({ content, highlight }: ContentViewerProps) => {
  const editor = useMemo(() => withReact(createEditor()), []);
  
  const safeContent: Descendant[] = Array.isArray(content) && content.length > 0
    ? content
    : [{ type: 'paragraph', children: [{ text: '' }] }];

  // Sửa lại signature của hàm decorate
  const decorate = useCallback(([node, path]: NodeEntry) => {
    const ranges: Range[] = [];
    if (highlight && Text.isText(node)) {
      const { text } = node;
      const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
      let offset = 0;
      for (const part of parts) {
        if (part.toLowerCase() === highlight.toLowerCase()) {
          ranges.push({
            anchor: { path, offset },
            focus: { path, offset: offset + part.length },
            highlight: true,
          });
        }
        offset += part.length;
      }
    }
    return ranges;
  }, [highlight]);
  
  // Sửa lại hàm renderLeaf để render thẻ <mark>
  const renderLeaf = useCallback((props: RenderLeafProps) => {
    const { attributes, children, leaf } = props;
    return (
      <span {...attributes}>
        {leaf.highlight ? <mark>{children}</mark> : children}
      </span>
    );
  }, []);

  return (
    <Slate editor={editor} initialValue={safeContent}>
      <Editable 
        readOnly 
        placeholder="Không có nội dung..."
        decorate={decorate}
        renderLeaf={renderLeaf}
      />
    </Slate>
  );
};

export default ContentViewer;