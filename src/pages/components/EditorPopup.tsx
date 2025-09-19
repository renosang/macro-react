// src/pages/components/EditorPopup.tsx
import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { Resizable, ResizeCallback } from 're-resizable';
import useEditorStore from '../../stores/useEditorStore';
import LexicalEditor from './LexicalEditor';
import './EditorPopup.css';

const EditorPopup: React.FC = () => {
  const isOpen = useEditorStore((state) => state.isOpen);
  const toggleEditor = useEditorStore((state) => state.toggleEditor);
  
  const [size, setSize] = useState({ width: '70vw', height: '80vh' });
  const nodeRef = useRef(null);

  if (!isOpen) {
    return null;
  }
  
  const handleResizeStop: ResizeCallback = (e, direction, ref) => {
    setSize({
      width: ref.style.width,
      height: ref.style.height,
    });
  };

  return (
    <Draggable nodeRef={nodeRef} handle=".editor-popup-header">
      <div ref={nodeRef} className="editor-popup-overlay">
        <Resizable
          size={size}
          onResizeStop={handleResizeStop}
          minWidth={400}
          minHeight={300}
          className="editor-popup-container"
        >
          {/* Header với cấu trúc mới */}
          <div className="editor-popup-header">
            <div className="traffic-lights">
              <div className="dot dot-red" onClick={toggleEditor}><span>×</span></div>
              <div className="dot dot-yellow"><span>—</span></div>
              <div className="dot dot-green"><span>+</span></div>
            </div>
            <h3>Soạn thảo nhanh</h3>
          </div>
          
          <div className="editor-popup-content">
            {isOpen && <LexicalEditor />}
          </div>
        </Resizable>
      </div>
    </Draggable>
  );
};

export default EditorPopup;