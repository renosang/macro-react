// src/pages/components/LexicalEditor.tsx
import React, { useEffect } from 'react';
import { $getRoot, $createTextNode, $createParagraphNode } from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary'; // <-- SỬA LỖI Ở ĐÂY

import useEditorStore from '../../stores/useEditorStore';
import ToolbarPlugin from './ToolbarPlugin'; // Giả sử file này tồn tại

// Plugin để nạp lại nội dung đã lưu
const LoadInitialContentPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  const content = useEditorStore((state) => state.content);

  useEffect(() => {
    if (!content) return;
    const isContentLoaded = editor.getEditorState().isEmpty();
    if (!isContentLoaded) return;

    try {
      const initialEditorState = editor.parseEditorState(content);
      editor.setEditorState(initialEditorState);
    } catch (error) {
      console.error("Lỗi khi nạp trạng thái editor:", error);
    }
  }, [editor, content]);

  return null;
};

const editorConfig = {
  namespace: 'PopupEditor',
  theme: {},
  onError(error: Error) { throw error; },
};

const LexicalEditor: React.FC = () => {
  const setContent = useEditorStore((state) => state.setContent);

  const handleOnChange = (editorState: any) => {
    const editorStateJSON = JSON.stringify(editorState);
    setContent(editorStateJSON);
  };

  return (
    <LexicalComposer initialConfig={editorConfig}>
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
        <LoadInitialContentPlugin />
      </div>
    </LexicalComposer>
  );
};

export default LexicalEditor;