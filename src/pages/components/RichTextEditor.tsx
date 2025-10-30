// src/pages/components/RichTextEditor.tsx
import React, { useMemo, useCallback, useRef } from 'react';
import { Slate, Editable, withReact, RenderLeafProps, RenderElementProps, useSlate } from 'slate-react';
import { createEditor, Descendant, Editor, Transforms, Element as SlateElement } from 'slate';
import { withHistory } from 'slate-history';
import toast from 'react-hot-toast'; 
import isUrl from 'is-url'; 
import imageExtensions from 'image-extensions'; 
import './RichTextEditor.css';

const IMGBB_API_KEY = process.env.REACT_APP_IMGBB_API_KEY;

const uploadToImgBB = async (file: File): Promise<string | null> => {
  if (!IMGBB_API_KEY) {
    console.error('Lỗi: REACT_APP_IMGBB_API_KEY chưa được cấu hình.');
    toast.error('Lỗi cấu hình: Không tìm thấy API key của ImgBB.');
    return null;
  }
  const toastId = toast.loading('Đang tải ảnh lên...');
  const formData = new FormData();
  formData.append('image', file);
  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      { method: 'POST', body: formData }
    );
    const data = await response.json();
    if (data.success && data.data.url) {
      toast.success('Tải ảnh lên thành công!', { id: toastId });
      return data.data.url;
    } else {
      throw new Error(data.error?.message || 'Lỗi không xác định từ ImgBB');
    }
  } catch (error: any) {
    toast.error(`Tải ảnh thất bại: ${error.message}`, { id: toastId });
    console.error('Lỗi upload ImgBB:', error);
    return null;
  }
};

const insertImage = (editor: Editor, url: string) => {
  const text = { text: '' };
  const image: Partial<SlateElement> = { type: 'image', url, children: [text] };
  Transforms.insertNodes(editor, image as SlateElement);
  Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] } as SlateElement);
};

const isImageUrl = (url: string) => {
  if (!url || !isUrl(url)) return false;
  try {
    const ext = url.split('.').pop()?.split('?')[0];
    return ext ? imageExtensions.includes(ext) : false;
  } catch (e) { return false; }
};

const withImages = (editor: Editor) => {
  const { insertData, isVoid } = editor;

  editor.isVoid = element => {
    return (element as any).type === 'image' ? true : isVoid(element);
  };

  editor.insertData = (data: DataTransfer) => {
    const text = data.getData('text/plain');
    const { files } = data;

    if (files && files.length > 0) {
      for (const file of Array.from(files)) {
        const [mime] = file.type.split('/');
        if (mime === 'image') {
          (async () => {
            const publicUrl = await uploadToImgBB(file);
            if (publicUrl) {
              insertImage(editor, publicUrl);
            }
          })();
        }
      }
    } 
    else if (isImageUrl(text)) {
      insertImage(editor, text);
    } 
    else {
      insertData(data);
    }
  };

  return editor;
};


type MarkFormat = 'bold' | 'italic' | 'underline' | 'color';
type AlignFormat = 'left' | 'center' | 'right';
type ListFormat = 'numbered-list' | 'bulleted-list';

const LIST_TYPES: ListFormat[] = ['numbered-list', 'bulleted-list'];

const CustomEditor = {
  isMarkActive(editor: Editor, format: MarkFormat) {
    const marks = Editor.marks(editor);
    if (format === 'color') return !!marks?.color;
    return marks ? (marks as any)[format] === true : false;
  },
  toggleMark(editor: Editor, format: 'bold' | 'italic' | 'underline') {
    const isActive = CustomEditor.isMarkActive(editor, format);
    if (isActive) { Editor.removeMark(editor, format); }
    else { Editor.addMark(editor, format, true); }
  },

  isBlockActive(editor: Editor, format: AlignFormat | ListFormat) {
    const { selection } = editor;
    if (!selection) return false;
    const [match] = Array.from(Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n => {
        if (Editor.isEditor(n) || !SlateElement.isElement(n)) {
          return false;
        }
        if ('align' in n && n.align === format) {
          return true;
        }
        if (n.type === format) {
          return true;
        }
        return false;
      },
    }));
    return !!match;
  },

  toggleBlock(editor: Editor, format: ListFormat) {
    const isActive = CustomEditor.isBlockActive(editor, format);
    const isList = LIST_TYPES.includes(format);
    Transforms.unwrapNodes(editor, {
      match: n => !Editor.isEditor(n) && SlateElement.isElement(n) && LIST_TYPES.includes((n as any).type),
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
    const marks = Editor.marks(editor);
    if (marks?.color === color) {
        Editor.removeMark(editor, 'color');
    } else {
        Editor.addMark(editor, 'color', color);
    }
  },
};

const MarkButton = ({ format, children }: { format: 'bold' | 'italic' | 'underline', children: React.ReactNode }) => {
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
    const marks = Editor.marks(editor);
    const isActive = marks?.color === color;
    return <button type="button" className={`toolbar-button color-button ${isActive ? 'active' : ''}`} style={{ color: color }} onMouseDown={e => { e.preventDefault(); CustomEditor.setColor(editor, color); }}>{children}</button>;
};
const AddImageButton = () => {
  const editor = useSlate();
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const publicUrl = await uploadToImgBB(file);
      if (publicUrl) {
        insertImage(editor, publicUrl);
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  };
  return (
    <>
      <button type="button" className="toolbar-button" onMouseDown={event => { event.preventDefault(); inputRef.current?.click(); }}> 🖼️ </button>
      <input type="file" ref={inputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
    </>
  );
};
const Image = (props: RenderElementProps) => {
  const { attributes, children, element } = props;
  return (
    <div {...attributes}>
      <div contentEditable={false}>
        <img src={(element as any).url} alt="" style={{ display: 'block', maxWidth: '100%', maxHeight: '500px', boxShadow: '0 0 5px rgba(0,0,0,0.2)', borderRadius: '4px' }} />
      </div>
      {children}
    </div>
  );
};


interface RichTextEditorProps {
  value: Descendant[];
  onChange: (value: Descendant[]) => void;
}

const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
  const editor = useMemo(() => withImages(withHistory(withReact(createEditor()))), []);

  const renderElement = useCallback((props: RenderElementProps) => {
    const { attributes, children, element } = props;
    const style = { textAlign: (element as any).align };
    switch ((element as any).type) {
      case 'image': // Thêm case image
        return <Image {...props} />;
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
    if ((props.leaf as any).bold) children = <strong>{children}</strong>;
    if ((props.leaf as any).italic) children = <em>{children}</em>;
    if ((props.leaf as any).underline) children = <u>{children}</u>;
    if ((props.leaf as any).color) children = <span style={{ color: (props.leaf as any).color }}>{children}</span>;
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
          <ColorButton color="#000000">A</ColorButton> {/* Nút màu đen */}
          <ColorButton color="#d9534f">A</ColorButton>
          <ColorButton color="#007bff">A</ColorButton>
          <ColorButton color="#28a745">A</ColorButton>
          <span className="toolbar-separator" />
          <AddImageButton /> {/* Nút upload ảnh */}
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