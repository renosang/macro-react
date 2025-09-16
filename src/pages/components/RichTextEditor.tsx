import React, { useMemo, useCallback } from 'react';
// SỬA LỖI 1: Di chuyển useSlate lên đây
import { Slate, Editable, withReact, RenderLeafProps, useSlate } from 'slate-react';
import { createEditor, Descendant, Editor, Text } from 'slate';
import { withHistory } from 'slate-history';
import './RichTextEditor.css';

// --- CÁC HÀM HỖ TRỢ LOGIC CHO EDITOR (ĐÃ CẬP NHẬT) ---
const CustomEditor = {
  isBoldMarkActive(editor: Editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.bold === true : false;
  },
  isItalicMarkActive(editor: Editor) {
    const marks = Editor.marks(editor);
    return marks ? marks.italic === true : false;
  },
  // SỬA LỖI 2: Viết lại hàm toggleBoldMark
  toggleBoldMark(editor: Editor) {
    const isActive = CustomEditor.isBoldMarkActive(editor);
    if (isActive) {
      Editor.removeMark(editor, 'bold');
    } else {
      Editor.addMark(editor, 'bold', true);
    }
  },
  // SỬA LỖI 2: Viết lại hàm toggleItalicMark
  toggleItalicMark(editor: Editor) {
    const isActive = CustomEditor.isItalicMarkActive(editor);
    if (isActive) {
      Editor.removeMark(editor, 'italic');
    } else {
      Editor.addMark(editor, 'italic', true);
    }
  },
};

// --- COMPONENT CHO CÁC NÚT BẤM ---
const MarkButton = ({ format, children }: { format: 'bold' | 'italic', children: React.ReactNode }) => {
  const editor = useSlate();
  const isActive = format === 'bold' 
    ? CustomEditor.isBoldMarkActive(editor) 
    : CustomEditor.isItalicMarkActive(editor);

  return (
    <button
      type="button" // Thêm type="button" để tránh submit form
      className={`toolbar-button ${isActive ? 'active' : ''}`}
      onMouseDown={event => {
        event.preventDefault();
        format === 'bold' ? CustomEditor.toggleBoldMark(editor) : CustomEditor.toggleItalicMark(editor);
      }}
    >
      {children}
    </button>
  );
};

// --- COMPONENT EDITOR CHÍNH ---
interface RichTextEditorProps {
  value: Descendant[];
  onChange: (value: Descendant[]) => void;
}

const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  
  const renderLeaf = useCallback((props: RenderLeafProps) => {
    let { children } = props;
    if (props.leaf.bold) {
      children = <strong>{children}</strong>;
    }
    if (props.leaf.italic) {
      children = <em>{children}</em>;
    }
    return <span {...props.attributes}>{children}</span>;
  }, []);

  return (
    <div className="editor-container">
      <Slate editor={editor} initialValue={value} onChange={onChange}>
        <div className="toolbar">
          <MarkButton format="bold"><b>B</b></MarkButton>
          <MarkButton format="italic"><i>I</i></MarkButton>
        </div>
        
        <Editable
          className="editable-area"
          placeholder="Nhập nội dung macro..."
          renderLeaf={renderLeaf}
        />
      </Slate>
    </div>
  );
};

export default RichTextEditor;