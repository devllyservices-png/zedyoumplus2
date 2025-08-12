"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { User, LogIn } from "lucide-react"
import { useRouter } from "next/navigation"

interface LoginPopupProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginPopup({ isOpen, onClose }: LoginPopupProps) {
  const router = useRouter()

  const handleLoginClick = () => {
    onClose()
    router.push("/login")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">تسجيل الدخول مطلوب</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-2">يجب تسجيل الدخول أولاً لطلب هذه الخدمة</p>
            <p className="text-sm text-gray-500">سجل دخولك للمتابعة وإتمام عملية الطلب</p>
          </div>

          <div className="flex gap-3 w-full">
            <Button onClick={handleLoginClick} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
              <LogIn className="w-4 h-4 mr-2" />
              تسجيل الدخول
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
