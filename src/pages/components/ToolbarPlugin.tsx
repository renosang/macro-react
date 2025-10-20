// src/pages/components/ToolbarPlugin.tsx
import React from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { FORMAT_TEXT_COMMAND } from 'lexical';

const ToolbarPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  return (
    <div className="toolbar" style={{ padding: '8px', borderBottom: '1px solid #ccc', background: '#f7f7f7' }}>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        style={{ marginRight: '8px', fontWeight: 'bold' }}
      >
        B
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        style={{ marginRight: '8px', fontStyle: 'italic' }}
      >
        I
      </button>
      <button
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        style={{ textDecoration: 'underline' }}
      >
        U
      </button>
    </div>
  );
};

export default ToolbarPlugin;