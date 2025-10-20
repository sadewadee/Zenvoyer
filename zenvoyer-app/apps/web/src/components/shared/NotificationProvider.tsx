/**
 * NotificationProvider Component
 * Component untuk menampilkan notifications dari UI store
 */

import React from 'react';
import { useUIStore, Notification } from '../../lib/store/ui';
import { NotificationType } from '../../lib/constants/enums';
import { cn } from '../../lib/utils/cn';

interface NotificationItemProps {
  notification: Notification;
  onClose: (id: string) => void;
}

/**
 * Single notification item
 */
const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose }) => {
  const baseClass = 'fixed top-4 right-4 p-4 rounded-lg shadow-lg max-w-md z-50 animate-fade-in';

  const typeClass = {
    [NotificationType.SUCCESS]: 'bg-green-50 border border-green-200 text-green-800',
    [NotificationType.ERROR]: 'bg-red-50 border border-red-200 text-red-800',
    [NotificationType.WARNING]: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
    [NotificationType.INFO]: 'bg-blue-50 border border-blue-200 text-blue-800',
  }[notification.type];

  const iconClass = {
    [NotificationType.SUCCESS]: '✓',
    [NotificationType.ERROR]: '✕',
    [NotificationType.WARNING]: '⚠',
    [NotificationType.INFO]: 'ℹ',
  }[notification.type];

  return (
    <div className={cn(baseClass, typeClass)}>
      <div className="flex items-start gap-3">
        <span className="text-lg font-bold flex-shrink-0">{iconClass}</span>
        <div className="flex-1 min-w-0">
          {notification.title && (
            <h3 className="font-semibold text-sm mb-1">{notification.title}</h3>
          )}
          <p className="text-sm break-words">{notification.message}</p>
        </div>
        {notification.closable && (
          <button
            onClick={() => onClose(notification.id)}
            className="text-lg font-bold flex-shrink-0 hover:opacity-70 transition-opacity"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Notification Provider - render all notifications
 */
export const NotificationProvider: React.FC = () => {
  const { notifications, removeNotification } = useUIStore();

  return (
    <div className="fixed top-0 right-0 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationProvider;
