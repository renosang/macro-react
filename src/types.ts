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
  status: 'pending' | 'approved';
  submittedBy?: string; // <-- Thuộc tính đã được thêm vào
}

export interface Announcement {
  _id: string;
  content: Descendant[];
  timestamp: string;
}

export interface User {
  _id: string;
  username: string;
  fullName: string; 
  email: string;
  role: 'user' | 'admin';
  password?: string;
  lastLogin?: string | null;
}

