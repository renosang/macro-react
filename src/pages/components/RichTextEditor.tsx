import React, { useMemo, useCallback } from 'react';
import { Slate, Editable, withReact, RenderLeafProps, RenderElementProps, useSlate } from 'slate-react';
import { createEditor, Descendant, Editor, Text, Transforms, Element as SlateElement } from 'slate';
import { withHistory } from 'slate-history';
import './RichTextEditor.css';

type MarkFormat = 'bold' | 'italic' | 'underline';
type AlignFormat = 'left' | 'center' | 'right';
type ListFormat = 'numbered-list' | 'bulleted-list';

const LIST_TYPES: ListFormat[] = ['numbered-list', 'bulleted-list'];

const CustomEditor = {
  isMarkActive(editor: Editor, format: MarkFormat) {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  },
  toggleMark(editor: Editor, format: MarkFormat) {
    const isActive = CustomEditor.isMarkActive(editor, format);
    if (isActive) { Editor.removeMark(editor, format); }
    else { Editor.addMark(editor, format, true); }
  },
  isBlockActive(editor: Editor, format: AlignFormat | ListFormat) {
    const { selection } = editor;
    if (!selection) return false;
    const [match] = Array.from(Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && (n.type === format || n.align === format),
    }));
    return !!match;
  },
  toggleBlock(editor: Editor, format: ListFormat) {
    const isActive = CustomEditor.isBlockActive(editor, format);
    const isList = LIST_TYPES.includes(format);
    Transforms.unwrapNodes(editor, {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes(n.type as ListFormat),
      split: true,
    });
    const newProperties: Partial<SlateElement> = {
      type: isActive ? 'paragraph' : 'list-item',
    };
    Transforms.setNodes<SlateElement>(editor, newProperties);
    if (!isActive && isList) {
      const block = { type: format, children: [] };
      Transforms.wrapNodes(editor, block);
    }
  },
  toggleAlign(editor: Editor, align: AlignFormat) {
    Transforms.setNodes<SlateElement>(editor, { align }, {
        match: n => SlateElement.isElement(n) && Editor.isBlock(editor, n)
    });
  },
  setColor(editor: Editor, color: string) {
    Editor.addMark(editor, 'color', color);
  },
};

const MarkButton = ({ format, children }: { format: MarkFormat, children: React.ReactNode }) => {
    const editor = useSlate();
    return <button type="button" className={`toolbar-button ${CustomEditor.isMarkActive(editor, format) ? 'active' : ''}`} onMouseDown={e => { e.preventDefault(); CustomEditor.toggleMark(editor, format); }}>{children}</button>;
};
const BlockButton = ({ format, children }: { format: ListFormat, children: React.ReactNode }) => {
    const editor = useSlate();
    return <button type="button" className={`toolbar-button ${CustomEditor.isBlockActive(editor, format) ? 'active' : ''}`} onMouseDown={e => { e.preventDefault(); CustomEditor.toggleBlock(editor, format); }}>{children}</button>;
};
const AlignButton = ({ align, children }: { align: AlignFormat, children: React.ReactNode }) => {
    const editor = useSlate();
    return <button type="button" className={`toolbar-button ${CustomEditor.isBlockActive(editor, align) ? 'active' : ''}`} onMouseDown={e => { e.preventDefault(); CustomEditor.toggleAlign(editor, align); }}>{children}</button>;
};
const ColorButton = ({ color, children }: { color: string, children: React.ReactNode }) => {
    const editor = useSlate();
    return <button type="button" className="toolbar-button color-button" style={{ color: color }} onMouseDown={e => { e.preventDefault(); CustomEditor.setColor(editor, color); }}>{children}</button>;
};

interface RichTextEditorProps {
  value: Descendant[];
  onChange: (value: Descendant[]) => void;
}

const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

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

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    let { children } = props;
    if (props.leaf.bold) children = <strong>{children}</strong>;
    if (props.leaf.italic) children = <em>{children}</em>;
    if (props.leaf.underline) children = <u>{children}</u>;
    if (props.leaf.color) children = <span style={{ color: props.leaf.color }}>{children}</span>;
    return <span {...props.attributes}>{children}</span>;
  }, []);

  return (
    <div className="editor-container">
      <Slate editor={editor} initialValue={value} onChange={onChange}>
        <div className="toolbar">
          <MarkButton format="bold"><b>B</b></MarkButton>
          <MarkButton format="italic"><i>I</i></MarkButton>
          <MarkButton format="underline"><u>U</u></MarkButton>
          <span className="toolbar-separator" />
          <AlignButton align="left">Left</AlignButton>
          <AlignButton align="center">Center</AlignButton>
          <AlignButton align="right">Right</AlignButton>
          <span className="toolbar-separator" />
          <BlockButton format="numbered-list">1.</BlockButton>
          <BlockButton format="bulleted-list">•</BlockButton>
          <span className="toolbar-separator" />
          <ColorButton color="#d9534f">A</ColorButton>
          <ColorButton color="#007bff">A</ColorButton>
          <ColorButton color="#28a745">A</ColorButton>
        </div>

        <Editable
          className="editable-area"
          placeholder="Nhập nội dung macro..."
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          autoFocus
        />
      </Slate>
    </div>
  );
};

export default RichTextEditor;