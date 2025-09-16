/// <reference types="react-scripts" />

declare module '*.png' {
  const value: any;
  export default value;
}

// --- CẬP NHẬT KHAI BÁO CHO SLATE ---
import { BaseEditor, BaseRange } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';

type CustomElement = { type: 'paragraph'; children: CustomText[] };
// Thêm thuộc tính highlight (tùy chọn) vào CustomText
type CustomText = { text: string; highlight?: boolean };

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
  // Mở rộng interface Range để chấp nhận thuộc tính highlight
  interface Range extends BaseRange {
    highlight?: boolean;
  }
}