import React, { useEffect, useMemo } from 'react';
import { createEditor, Descendant } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import './RichTextEditor.css';
// ... (phần khai báo 'declare module 'slate'' giữ nguyên) ...

// Component giờ sẽ nhận props để có thể điều khiển từ bên ngoài
interface RichTextEditorProps {
  value: Descendant[];
  onChange: (value: Descendant[]) => void;
}

const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  return (
    <div className="editor-container">
      {/* value và onChange giờ được lấy từ props */}
      <Slate editor={editor} initialValue={value} onChange={onChange}>
        <Editable
          className="editable-area"
          placeholder="Nhập nội dung macro..."
        />
      </Slate>
    </div>
  );
};

export default RichTextEditor;