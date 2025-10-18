/**
 * UI Store (Zustand)
 * Global state untuk UI (notifications, modals, etc)
 */

import { create } from 'zustand';
import { NotificationType } from '../constants/enums';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  duration?: number; // milliseconds, 0 = permanent
  closable?: boolean;
}

export interface UIState {
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  // Global loading state
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Sidebar state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Modal state
  modals: Record<string, boolean>;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  closeAllModals: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Notifications
  notifications: [],

  addNotification: (notification) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const fullNotification: Notification = {
      ...notification,
      id,
      closable: notification.closable ?? true,
    };

    set((state) => ({
      notifications: [...state.notifications, fullNotification],
    }));

    // Auto-remove if duration is set
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, notification.duration);
    }

    return id;
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearNotifications: () =>
    set({
      notifications: [],
    }),

  // Global loading
  isLoading: false,

  setLoading: (isLoading) =>
    set({
      isLoading,
    }),

  // Sidebar
  sidebarOpen: true,

  setSidebarOpen: (sidebarOpen) =>
    set({
      sidebarOpen,
    }),

  // Modals
  modals: {},

  openModal: (modalId) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modalId]: true,
      },
    })),

  closeModal: (modalId) =>
    set((state) => ({
      modals: {
        ...state.modals,
        [modalId]: false,
      },
    })),

  closeAllModals: () =>
    set({
      modals: {},
    }),
}));

export default useUIStore;
