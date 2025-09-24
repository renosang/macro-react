import { Descendant } from 'slate';

export interface Category {
  _id: string;
  name: string;
}

export interface Macro {
  _id: string; 
  title: string;
  category: string;
  content: Descendant[];
}

export interface Announcement {
  id: number; // Tạm giữ vì chưa chuyển qua DB
  content: Descendant[];
  timestamp: string;
}

export interface User {
  _id: string;
  username: string;
  role: 'user' | 'admin';
}
