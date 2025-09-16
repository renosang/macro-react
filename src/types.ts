import { Descendant } from 'slate';

export interface Category {
  id: number;
  name: string;
}

export interface Macro {
  id: number;
  title: string;
  category: string;
  content: Descendant[];
}

export interface Announcement {
  id: number;
  content: Descendant[];
  timestamp: string;
}