import { useNotifications as useNotificationsContext } from "@/context/NotificationContext";
import { NotificationContextValue } from "@/context/NotificationContext";

export function useNotifications(): NotificationContextValue {
  return useNotificationsContext();
}
