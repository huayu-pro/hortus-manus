/**
 * HORTUS MANUS — toast helpers (owner: stage).
 * The Toaster itself is mounted once by App.tsx; these wrappers keep the copy
 * and the paper styling consistent across pages.
 */
import { toast as sonnerToast } from 'sonner'

export const toast = {
  info(message: string) {
    sonnerToast(message)
  },
  success(message: string) {
    sonnerToast.success(message)
  },
  error(message: string) {
    sonnerToast.error(message)
  },
  message(message: string) {
    sonnerToast.message(message)
  },
}

export type ToastApi = typeof toast
