import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Announcement } from '../../App';
import ContentViewer from './ContentViewer';
import './BroadcastBanner.css';

interface Props {
  announcement?: Announcement;
}

const BroadcastBanner = ({ announcement }: Props) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (announcement) {
      const dismissedId = localStorage.getItem('dismissedAnnouncementId');
      if (String(announcement.id) !== dismissedId) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    } else {
      setIsVisible(false);
    }
  }, [announcement]);

  const handleDismiss = () => {
    if (announcement) {
      localStorage.setItem('dismissedAnnouncementId', String(announcement.id));
      setIsVisible(false);
      toast.success('Đã ẩn thông báo.');
    }
  };

  if (!isVisible || !announcement) {
    return null;
  }

  return (
    <div className="broadcast-banner">
      <div className="banner-content">
        <ContentViewer content={announcement.content} />
      </div>
      <button className="dismiss-btn" onClick={handleDismiss} title="Ẩn thông báo này">&times;</button>
    </div>
  );
};

export default BroadcastBanner;