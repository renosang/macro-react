// src/pages/components/SlateComponents.tsx
import React, { useRef } from 'react';
import { useSlate } from 'slate-react';
import { Editor } from 'slate'; 
import { CustomEditor, TextMark } from '../../types';
import toast from 'react-hot-toast';
console.log("IMGBB API Key from process.env:", process.env.REACT_APP_IMGBB_API_KEY);
const IMGBB_API_KEY = process.env.REACT_APP_IMGBB_API_KEY;

export const uploadToImgBB = async (file: File): Promise<string | null> => {
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

const isMarkActive = (editor: CustomEditor, format: TextMark) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};
const toggleMark = (editor: CustomEditor, format: TextMark) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) Editor.removeMark(editor, format);
  else Editor.addMark(editor, format, true);
};

export const Toolbar = ({ children }: { children: React.ReactNode }) => (
  <div className="slate-toolbar">{children}</div>
);

export const MarkButton = ({ format, icon, style }: { format: TextMark, icon: string, style?: React.CSSProperties }) => {
  const editor = useSlate() as CustomEditor;
  const isActive = isMarkActive(editor, format);
  return (
    <button
      type="button"
      className={`slate-toolbar-button ${isActive ? 'active' : ''}`}
      style={style}
      onMouseDown={event => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      {icon}
    </button>
  );
};

export const BlockButton = ({ format, icon }: { format: string, icon: string }) => {
  return <button type="button">{icon}</button>; 
};

export const AddImageButton = ({ onImageUpload }: { onImageUpload: (url: string) => void }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const publicUrl = await uploadToImgBB(file);
      if (publicUrl) {
        onImageUpload(publicUrl);
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <button
        type="button"
        className="slate-toolbar-button"
        onMouseDown={event => {
          event.preventDefault();
          inputRef.current?.click();
        }}
      >
        🖼️
      </button>
      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        className="image-upload-input"
        onChange={handleFileChange}
      />
    </>
  );
};