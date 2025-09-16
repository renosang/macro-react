/// <reference types="react-scripts" />

declare module '*.png' {
  const value: any;
  export default value;
}

// --- KHAI BÁO CHO SLATE ---
import { BaseEditor, BaseRange } from 'slate';
import { ReactEditor } from 'slate-react';
import { HistoryEditor } from 'slate-history';

type CustomElement = 
  | { type: 'paragraph'; align?: 'left' | 'center' | 'right'; children: CustomText[] }
  | { type: 'bulleted-list'; align?: 'left' | 'center' | 'right'; children: CustomText[] }
  | { type: 'numbered-list'; align?: 'left' | 'center' | 'right'; children: CustomText[] }
  | { type: 'list-item'; align?: 'left' | 'center' | 'right'; children: CustomText[] };

type CustomText = { 
  text: string; 
  highlight?: boolean;
  bold?: boolean; 
  italic?: boolean;
  underline?: boolean;
  color?: string;
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