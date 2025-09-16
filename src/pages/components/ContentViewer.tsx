import React, { useMemo, useCallback } from 'react';
import { createEditor, Descendant, Text, Range, NodeEntry } from 'slate';
import { Slate, Editable, withReact, RenderLeafProps, RenderElementProps } from 'slate-react';

interface ContentViewerProps {
  content: Descendant[];
  highlight?: string;
}

const ContentViewer = ({ content, highlight }: ContentViewerProps) => {
  const editor = useMemo(() => withReact(createEditor()), []);
  
  const safeContent: Descendant[] = Array.isArray(content) && content.length > 0
    ? content
    : [{ type: 'paragraph', children: [{ text: '' }] }];

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

  const renderElement = useCallback((props: RenderElementProps) => {
    const { attributes, children, element } = props;
    const style = { textAlign: element.align };
    switch (element.type) {
      case 'bulleted-list':
        return <ul style={style} {...attributes}>{children}</ul>;
      case 'numbered-list':
        return <ol style={style} {...attributes}>{children}</ol>;
      case 'list-item':
        return <li {...attributes}>{children}</li>;
      default:
        return <p style={style} {...attributes}>{children}</p>;
    }
  }, []);

  // SỬA LỖI: Lấy thêm `attributes` từ `props`
  const renderLeaf = useCallback((props: RenderLeafProps) => {
    const { attributes } = props; // <-- Lấy attributes ở đây
    let { children, leaf } = props;

    if (leaf.bold) children = <strong>{children}</strong>;
    if (leaf.italic) children = <em>{children}</em>;
    if (leaf.underline) children = <u>{children}</u>;
    if (leaf.color) children = <span style={{ color: leaf.color }}>{children}</span>;
    if (leaf.highlight) children = <mark>{children}</mark>;
    
    // Sử dụng `attributes` đã lấy được
    return <span {...attributes}>{children}</span>;
  }, []);

  return (
    <Slate editor={editor} initialValue={safeContent}>
      <Editable
        readOnly
        placeholder="Không có nội dung..."
        decorate={decorate}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
      />
    </Slate>
  );
};

export default ContentViewer;