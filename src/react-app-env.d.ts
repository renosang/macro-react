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
// THÊM CÁC THUỘC TÍNH ĐỊNH DẠNG VÀO ĐÂY
type CustomText = { 
  text: string; 
  highlight?: boolean;
  bold?: boolean; 
  italic?: boolean;
};

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
  interface Range extends BaseRange {
    highlight?: boolean;
  }
}