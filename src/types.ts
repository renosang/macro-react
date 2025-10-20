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