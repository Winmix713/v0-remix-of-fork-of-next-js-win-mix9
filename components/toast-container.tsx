"use client"

import { ToastComponent, useToast } from "./toast"

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div id="toastContainer" className="fixed top-4 right-4 z-[70] space-y-2">
      {toasts.map((toast) => (
        <ToastComponent key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

// Export the hook for use in other components
export { useToast }
