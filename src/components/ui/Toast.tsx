'use client'
import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | ''

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [message, onClose])

  if (!message) return null

  const bg = type === 'success' ? 'bg-sage' : type === 'error' ? 'bg-red-800' : 'bg-ink'

  return (
    <div className={`fixed bottom-6 right-6 ${bg} text-paper px-5 py-3 rounded-lg text-sm font-medium shadow-lg z-50 max-w-xs animate-fade-in`}>
      {message}
    </div>
  )
}

// Hook para usar toast fácilmente
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: ToastType }>({ message: '', type: '' })

  const showToast = (message: string, type: ToastType = '') => setToast({ message, type })
  const clearToast = () => setToast({ message: '', type: '' })

  return { toast, showToast, clearToast }
}
