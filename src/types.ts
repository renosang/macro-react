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

export interface TaskUser {
  _id: string;
  fullName: string;
  username: string;
}

// --- Định nghĩa cho Task (Bạn đã có, bao gồm description) ---
export interface Task {
  _id: string;
  title: string;
  description: string;
  isComplete: boolean;
  deadline: string | null;
  assignedTo: TaskUser;   // <-- Sử dụng TaskUser
  assignedBy: TaskUser;   // <-- Sử dụng TaskUser
  createdAt: string;
  updatedAt: string; // <-- Thêm updatedAt nếu API trả về
  // Các trường trạng thái thông báo (completionNotified, etc.) nếu cần ở frontend
}

// --- THÊM CÁC KIỂU CHO NOTIFICATION ---
export type NotificationType = 'newTask' | 'taskCompleted' | 'deadlineUpcoming';

export interface BaseNotification {
  _id: string; // ID của task liên quan
  type: NotificationType;
  message: string;
  timestamp: string;
}
export interface NewTaskNotification extends BaseNotification {
  type: 'newTask';
  relatedTask?: { // Dùng optional chaining (?) nếu API có thể không trả về đầy đủ
    _id: string;
    title?: string; // Dùng optional
    assignedBy?: { fullName?: string }; // Dùng optional
  };
}
export interface TaskCompletedNotification extends BaseNotification {
  type: 'taskCompleted';
  relatedTask?: {
    _id: string;
    title?: string;
    assignedTo?: { fullName?: string };
  };
}
export interface DeadlineNotification extends BaseNotification {
  type: 'deadlineUpcoming';
  relatedTask?: {
    _id: string;
    title?: string;
    deadline?: string;
    // Thêm assignedTo/assignedBy nếu cần hiển thị tên trong message ở frontend
    assignedTo?: { _id: string, fullName?: string };
    assignedBy?: { _id: string, fullName?: string };
  };
}

// Union Type chính cho Notification
export type Notification = NewTaskNotification | TaskCompletedNotification | DeadlineNotification;

// --- Định nghĩa cho NotificationTask (Kiểu cơ bản trả về từ hook cũ - có thể không cần nữa) ---
// Bạn có thể giữ lại hoặc xóa nếu không dùng đến
export interface NotificationTask {
  _id: string;
  title: string;
  assignedBy: {
    fullName: string;
  };
  createdAt: string;
}