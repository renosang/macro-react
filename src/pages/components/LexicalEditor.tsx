import React from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';

import useEditorStore from '../../stores/useEditorStore';
import ToolbarPlugin from './ToolbarPlugin';

const editorTheme = {
  // Bạn có thể thêm các theme tùy chỉnh cho editor tại đây
};

function onError(error: Error) {
  console.error(error);
}

const LexicalEditor: React.FC = () => {
  const { content, setContent, _hasHydrated } = useEditorStore();

  const handleOnChange = (editorState: any) => {
    const editorStateJSON = JSON.stringify(editorState);
    setContent(editorStateJSON);
  };
  
  // Rất quan trọng: Chỉ render editor khi store đã nạp xong dữ liệu từ localStorage
  if (!_hasHydrated) {
    return null; // Hoặc hiển thị một component loading
  }

  const initialConfig = {
    namespace: 'PopupEditor',
    theme: editorTheme,
    onError,
    // Nạp trực tiếp nội dung đã lưu vào editor khi khởi tạo
    editorState: content,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <ToolbarPlugin />
        <div className="editor-inner-content" style={{ flex: 1, position: 'relative', overflow: 'auto' }}>
          <RichTextPlugin
            contentEditable={<ContentEditable style={{ height: '100%', width: '100%', outline: 'none', padding: '10px' }} />}
            placeholder={<div style={{ position: 'absolute', top: '10px', left: '10px', color: '#999', pointerEvents: 'none' }}>Soạn thảo nội dung...</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <OnChangePlugin onChange={handleOnChange} />
      </div>
    </LexicalComposer>
  );
};

export default LexicalEditor;
