// src/pages/components/Header.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, NavLink } from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';
import './Header.css';
import { useTaskNotifications } from '../../hooks/useTaskNotifications';
import { Notification, NewTaskNotification, TaskCompletedNotification } from '../../types';

import {
  HiOutlineRectangleGroup,
  HiOutlineCheckBadge,
  HiOutlineQueueList,
  HiOutlineQuestionMarkCircle,
  HiOutlineCog,
  HiOutlineBars3,
  HiOutlineArrowRightOnRectangle,
  HiOutlinePencilSquare,
  HiOutlineLink,
  HiOutlineClipboardDocumentList,
  HiOutlineKey,
  HiOutlineBell,
  HiOutlineClock
} from 'react-icons/hi2';

// Ép kiểu các Icon
const IconPortal = HiOutlineRectangleGroup as React.ElementType;
const IconCQM = HiOutlineCheckBadge as React.ElementType;
const IconBacklog = HiOutlineQueueList as React.ElementType;
const IconFAQ = HiOutlineQuestionMarkCircle as React.ElementType;
const IconAdmin = HiOutlineCog as React.ElementType;
const IconMenu = HiOutlineBars3 as React.ElementType;
const IconLogout = HiOutlineArrowRightOnRectangle as React.ElementType;
const IconContribute = HiOutlinePencilSquare as React.ElementType;
const IconLinks = HiOutlineLink as React.ElementType;
const IconTasks = HiOutlineClipboardDocumentList as React.ElementType;
const IconChangePassword = HiOutlineKey as React.ElementType;
const IconBell = HiOutlineBell as React.ElementType;
const IconClockSmall = HiOutlineClock as React.ElementType;

function Header() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const { notifications, unreadCount, handleNotificationClick } = useTaskNotifications();

  useEffect(() => {
  }, [notifications]);


  const handleLogout = () => { /* ... */ };
  useEffect(() => { /* ... */ }, [menuRef, notifRef]);

  const handleNotifClickInternal = (notification: Notification) => {
    handleNotificationClick(notification);
    setIsNotifOpen(false);
  }

  const renderNotificationContent = (notification: Notification) => {
    let fallbackContent = <div className="notification-item-content"><span>{notification.message || 'Thông báo không hợp lệ'}</span></div>;

    try {
      if (notification.type === 'newTask') {
        const specificNotification = notification as NewTaskNotification;
        const relatedTask = specificNotification.relatedTask;
        const assignerName = relatedTask?.assignedBy?.fullName || 'Ai đó';
        const newTaskTitle = relatedTask?.title || 'task không tên';
        return (
          <div className="notification-item-content">
            <p className="notification-line-1">
              <strong style={{ color: '#0056b3' }}>{assignerName}</strong> đã gán cho bạn task:
            </p>
            <span className="notification-task-title">{newTaskTitle}</span>
          </div>
        );
      }
      else if (notification.type === 'taskCompleted') {
        const specificNotification = notification as TaskCompletedNotification;
        const relatedTask = specificNotification.relatedTask;
        const completerName = relatedTask?.assignedTo?.fullName || 'Ai đó';
        const completedTaskTitle = relatedTask?.title || 'task không tên';
        return (
          <div className="notification-item-content">
            <p className="notification-line-1">
              <strong style={{ color: '#0056b3' }}>{completerName}</strong> đã hoàn thành task:
            </p>
            <span className="notification-task-title">{completedTaskTitle}</span>
          </div>
        );
      }
      else if (notification.type === 'deadlineUpcoming') {
         const deadlineMsg = notification.message || 'Task sắp đến hạn!';
         return (
            <div className="notification-item-content">
              <p className="notification-line-1" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#856404' }}>
                <IconClockSmall style={{ fontSize: '1em', flexShrink: 0 }} />
                <span>{deadlineMsg}</span>
              </p>
            </div>
         );
      }
      else {
          console.warn("Loại thông báo không xác định:", notification);
          return fallbackContent;
      }
    } catch (e) {
      console.error("Lỗi render thông báo:", e, notification);
      return fallbackContent;
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/dashboard" className="header-logo-link">
          <img src="/logo.png" alt="Logo" className="header-logo" />
        </Link>
      </div>
      <div className="header-right">
        <span className="user-greeting">
          Xin chào, Chúc bạn làm việc hiệu quả ❤️!
        </span>

        {/* Nút chuông */}
        <div className="header-menu-container" ref={notifRef}>
          <button
            className="header-menu-toggle notification-btn"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
          >
            <IconBell />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {isNotifOpen && (
            <div className="header-menu-dropdown notification-dropdown">
              <h4>Thông báo</h4>
              {notifications.length === 0 ? (
                <span className="no-notif">Không có thông báo mới.</span>
              ) : (
                <ul>
                  {notifications.map((notification: Notification) => (
                    <li key={`${notification.type}-${notification._id}`}
                        onClick={() => handleNotifClickInternal(notification)}>
                      {renderNotificationContent(notification)}
                       <small className="notification-timestamp">
                         {notification.timestamp ? new Date(notification.timestamp).toLocaleString('vi-VN') : ''}
                       </small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Nút menu chính */}
        <div className="header-menu-container" ref={menuRef}>
          <button
            id="tour-main-menu"
            className="header-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <IconMenu />
          </button>

          {isMenuOpen && (
            <nav className="header-menu-dropdown">
              {/* Các NavLink */}
              <NavLink to="https://kb-portal.vercel.app/" target="_blank" end onClick={() => setIsMenuOpen(false)}> <IconPortal /><span>KB Portal</span> </NavLink>
              <NavLink to="https://onpointvn-my.sharepoint.com/:x:/r/personal/diep_truong_onpoint_vn/_layouts/15/doc2.aspx?sourcedoc=%7B811E44AC-EEB0-416E-A6CB-C3CAA957964D%7D&file=DATA%20CQM%20TTU%20-%20Ver3.2025.xlsx&fromShare=true&action=default&mobileredirect=true" target="_blank" onClick={() => setIsMenuOpen(false)}> <IconCQM /><span>Sai sót chất lượng</span> </NavLink>
              <NavLink to="https://docs.google.com/spreadsheets/u/0/d/19luSxwI2kUt0e5gJy1QZt7EOqJxzORcTIc__gEsDHcA/htmlview#gid=0" target="_blank" onClick={() => setIsMenuOpen(false)}> <IconFAQ /><span>FAQ tổng hợp</span> </NavLink>
              <NavLink to="https://beegadget.sg.larksuite.com/base/OF69bG6onayNSNsCc8kl2QKxgle?from=from_copylink" target="_blank" onClick={() => setIsMenuOpen(false)}> <IconBacklog /><span>Kiểm tra Backlog</span> </NavLink>
              <NavLink to="/dashboard/links" onClick={() => setIsMenuOpen(false)}> <IconLinks /><span>Quản lí liên kết</span> </NavLink>
              <NavLink to="/dashboard/tasks" onClick={() => setIsMenuOpen(false)}> <IconTasks /><span>Danh sách tác vụ</span> </NavLink>
              <NavLink to="/dashboard/contribute" id="tour-contribute-link" onClick={() => setIsMenuOpen(false)}> <IconContribute /><span>Đóng góp Macro</span> </NavLink>
              <div className="dropdown-separator"></div>
              {user?.role === 'admin' && ( <NavLink to="/admin" onClick={() => setIsMenuOpen(false)}> <IconAdmin /><span>Trang quản trị</span> </NavLink> )}
              <NavLink to="/dashboard/change-password" onClick={() => setIsMenuOpen(false)}> <IconChangePassword /><span>Đổi mật khẩu</span> </NavLink>
              <div className="dropdown-separator"></div>
              <button className="logout-menu-btn" onClick={handleLogout}> <IconLogout /><span>Đăng xuất</span> </button>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;