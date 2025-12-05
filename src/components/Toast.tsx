"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  showConfirm: (message: string, onConfirm: () => void) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const showConfirm = useCallback((message: string, onConfirm: () => void) => {
    setConfirmDialog({ message, onConfirm });
  }, []);

  const handleConfirm = () => {
    if (confirmDialog) {
      confirmDialog.onConfirm();
      setConfirmDialog(null);
    }
  };

  const handleCancel = () => {
    setConfirmDialog(null);
  };

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-gradient-to-r from-[#00D9FF] to-[#33E4FF] text-black";
      case "error":
        return "bg-gradient-to-r from-[#FF4D9A] to-[#FF80B8] text-white";
      case "warning":
        return "bg-gradient-to-r from-[#FFD447] to-[#FFE380] text-black";
      case "info":
        return "bg-gradient-to-r from-[#B17BFF] to-[#D0A8FF] text-white";
      default:
        return "bg-gradient-to-r from-[#00D9FF] to-[#33E4FF] text-black";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, showConfirm }}>
      {children}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${getToastStyles(toast.type)} px-6 py-3 rounded-lg shadow-2xl backdrop-blur-sm animate-in slide-in-from-right duration-300 min-w-[300px] max-w-md`}
          >
            <p className="font-medium text-sm">{toast.message}</p>
          </div>
        ))}
      </div>

      {/* Confirm Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-dark-card border border-dark-border rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-white mb-4">Confirm Action</h3>
            <p className="text-gray-300 mb-6">{confirmDialog.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg bg-dark-hover text-gray-300 hover:bg-dark-border transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FF4D9A] to-[#FF80B8] text-white hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-200 font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
