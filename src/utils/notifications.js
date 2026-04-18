import { getFromLocalStorage, saveToLocalStorage } from "./localStorage";

export const addNotification = (title, message, type = "workout", priority = "medium") => {
  const notifications = getFromLocalStorage("fitforge_notifications") || [];
  
  const newNotif = {
    id: Date.now(),
    title,
    message,
    type, // "workout", "nutrition", "hydration", "achievement", "planner", "admin"
    priority, // "low", "medium", "high"
    read: false,
    date: "Just now"
  };
  
  saveToLocalStorage("fitforge_notifications", [newNotif, ...notifications]);
  
  // Dispatch custom event to notify Topbar
  window.dispatchEvent(new Event("fitforge_new_notification"));
};
