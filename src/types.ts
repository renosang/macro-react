import { Descendant } from 'slate';

export interface Category {
  _id: string;
  name: string;
  parent?: string | null;
  children?: Category[];
}

export interface Macro {
  _id?: string;
  title: string;
  category: string | Category;
  subCategory?: string | null;
  content: Descendant[];
  status: 'pending' | 'approved';
  useCount: number; // <-- Thuộc tính đã được thêm vào
  submittedBy?: string; // <-- Thuộc tính đã được thêm vào
  modifiedBy?: string; // <-- Thuộc tính đã được thêm vào
  fullName: string; // <-- Thuộc tính đã được thêm vào
  updatedAt: string;
  createdBy?: {
    _id: string;
    fullName: string;
  };
  lastModifiedBy?: {
    _id: string;
    fullName: string;
  };
  platformTags?: {
    shopee?: boolean;
    lazada?: boolean;
    tiktok?: boolean;
    hasBrand?: boolean;
  };
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
  lastActivity?: string;
}

export interface Link {
  _id: string;
  team: string;
  title: string;
  url: string;
}

export interface Task {
  _id: string;
  title: string;
  status: 'pending' | 'completed';
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  _id: string;
  macro: string; // Macro ID
  macroTitle: string; // Macro Title
  content: string;
  status: 'pending' | 'addressed' | 'rejected';
  submittedBy: { // Thông tin người gửi
    _id: string;
    username: string;
    fullName: string;
  };
  createdAt: string;
  updatedAt: string;
}