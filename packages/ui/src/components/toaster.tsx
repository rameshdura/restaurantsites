"use client"

import { Toast, ToastClose, ToastDescription, ToastTitle } from "./toast"
import { useToast } from "../hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="pointer-events-none fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:top-auto sm:right-0 sm:bottom-0 sm:flex-col md:max-w-[420px]">
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="pointer-events-auto">
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
    </div>
  )
}
