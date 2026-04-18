import { toast } from "react-hot-toast";

export const notifySuccess = (message) => {
  toast.success(message, {
    duration: 3000,
    position: "top-right",
    style: {
      background: "#111827",
      color: "#fff",
      borderRadius: "12px",
      padding: "12px 16px",
      fontSize: "14px",
    },
  });
};

export const notifyError = (message) => {
  toast.error(message, {
    duration: 3000,
    position: "top-right",
    style: {
      background: "#7f1d1d",
      color: "#fff",
      borderRadius: "12px",
      padding: "12px 16px",
      fontSize: "14px",
    },
  });
};

export const notifyInfo = (message) => {
  toast(message, {
    duration: 2500,
    position: "top-right",
    style: {
      background: "#1f2937",
      color: "#fff",
      borderRadius: "12px",
      padding: "12px 16px",
      fontSize: "14px",
    },
  });
};