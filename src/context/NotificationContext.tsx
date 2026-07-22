import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from "react";
import * as chatService from "@/services/api/chat.service";
import { NotificationItem } from "@/types/chat.types";
import { extractErrorMessage } from "@/utils/errorHandler";

// ─── Actions ──────────────────────────────────────────────────────────────────

type NotificationAction =
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "LOAD_NOTIFICATIONS"; notifications: NotificationItem[] }
  | { type: "ADD_NOTIFICATION"; notification: NotificationItem }
  | { type: "MARK_READ"; id: number }
  | { type: "MARK_ALL_READ" }
  | { type: "LOGOUT" };

type NotificationState = {
  notifications: NotificationItem[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
};

const initialState: NotificationState = {
  notifications: [],
  loading: false,
  error: null,
  unreadCount: 0,
};

function notificationReducer(
  state: NotificationState,
  action: NotificationAction
): NotificationState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "SET_ERROR":
      return { ...state, error: action.error, loading: false };
    case "LOAD_NOTIFICATIONS":
      return {
        ...state,
        notifications: action.notifications,
        unreadCount: action.notifications.filter((n) => n.readed === 0).length,
        loading: false,
        error: null,
      };
    case "ADD_NOTIFICATION": {
      const exists = state.notifications.some(
        (n) => n.id === action.notification.id
      );
      if (exists) return state;
      const updated = [action.notification, ...state.notifications];
      return {
        ...state,
        notifications: updated,
        unreadCount: updated.filter((n) => n.readed === 0).length,
      };
    }
    case "MARK_READ": {
      const updated = state.notifications.map((n) =>
        n.id === action.id ? { ...n, readed: 1 } : n
      );
      return {
        ...state,
        notifications: updated,
        unreadCount: updated.filter((n) => n.readed === 0).length,
      };
    }
    case "MARK_ALL_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, readed: 1 })),
        unreadCount: 0,
      };
    case "LOGOUT":
      return initialState;
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

export type NotificationContextValue = {
  state: NotificationState;
  fetchNotifications: (companyId: number, includeRead?: boolean) => Promise<void>;
  markRead: (notificationId: number) => Promise<void>;
  markAllRead: (companyId: number) => Promise<void>;
  addNotification: (notification: NotificationItem) => void;
  logout: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  const fetchNotifications = useCallback(
    async (companyId: number, includeRead = false) => {
      dispatch({ type: "SET_LOADING", loading: true });
      try {
        const res = await chatService.getNotifications(companyId, includeRead);
        if (res.Good) {
          dispatch({
            type: "LOAD_NOTIFICATIONS",
            notifications: res.data?.notifications ?? [],
          });
        } else {
          dispatch({ type: "SET_ERROR", error: "Failed to load notifications" });
        }
      } catch (error) {
        dispatch({ type: "SET_ERROR", error: extractErrorMessage(error) });
      }
    },
    []
  );

  const markRead = useCallback(async (notificationId: number) => {
    try {
      const res = await chatService.markNotificationRead(notificationId);
      if (res.Good) {
        dispatch({ type: "MARK_READ", id: notificationId });
      }
    } catch {
      // Silent fail
    }
  }, []);

  const markAllRead = useCallback(async (companyId: number) => {
    try {
      const res = await chatService.markAllNotificationsRead(companyId);
      if (res.Good) {
        dispatch({ type: "MARK_ALL_READ" });
      }
    } catch {
      // Silent fail
    }
  }, []);

  const addNotification = useCallback((notification: NotificationItem) => {
    dispatch({ type: "ADD_NOTIFICATION", notification });
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: "LOGOUT" });
  }, []);

  const value: NotificationContextValue = useMemo(
    () => ({
      state,
      fetchNotifications,
      markRead,
      markAllRead,
      addNotification,
      logout,
    }),
    [
      state,
      fetchNotifications,
      markRead,
      markAllRead,
      addNotification,
      logout,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return ctx;
}
