"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, User, Package, Clock } from "lucide-react"
import Link from "next/link"

interface PaymentSuccessPopupProps {
  isOpen: boolean
  onClose: () => void
  orderId?: string
}

export default function PaymentSuccessPopup({ 
  isOpen, 
  onClose, 
  orderId 
}: PaymentSuccessPopupProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
      // Stop confetti after 3 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  return (
    <>
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(60)].map((_, i) => {
            const colors = [
              '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', 
              '#EF4444', '#EC4899', '#06B6D4', '#84CC16',
              '#F97316', '#6366F1', '#8B5A2B', '#DC2626'
            ]
            const color = colors[Math.floor(Math.random() * colors.length)]
            const delay = Math.random() * 4
            const duration = 4 + Math.random() * 3
            
            return (
              <div
                key={i}
                className="confetti-piece absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-30px',
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                }}
              >
                <div
                  className="w-4 h-4 rounded-full shadow-lg"
                  style={{
                    backgroundColor: color,
                  }}
                />
              </div>
            )
          })}
          
          {/* Additional confetti shapes */}
          {[...Array(40)].map((_, i) => {
            const colors = [
              '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', 
              '#EF4444', '#EC4899', '#06B6D4', '#84CC16'
            ]
            const color = colors[Math.floor(Math.random() * colors.length)]
            const delay = Math.random() * 4
            const duration = 4 + Math.random() * 3
            
            return (
              <div
                key={`shape-${i}`}
                className="confetti-piece absolute"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-30px',
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                }}
              >
                <div
                  className="w-3 h-3"
                  style={{
                    backgroundColor: color,
                    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                  }}
                />
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="sr-only">تم إرسال طلبك بنجاح</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-6 py-4">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            {/* Success Message */}
            <div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                تم إرسال طلبك بنجاح! 🎉
              </h2>
              <p className="text-gray-600 mb-4">
                شكراً لك على اختيار خدماتنا
              </p>
            </div>

            {/* Important Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-right">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    تحقق من ملفك الشخصي
                  </h3>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    يرجى التحقق من ملفك الشخصي بين الحين والآخر لمتابعة حالة طلبك وتلقي التحديثات من البائع.
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">الخطوات التالية:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <span>انتظار تأكيد البائع</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <span>بدء العمل على الطلب</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <span>استلام الخدمة المكتملة</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <Link href="/orders" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Package className="w-4 h-4 mr-2" />
                  عرض جميع طلباتي
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                متابعة التسوق
              </Button>
            </div>

            {/* Order ID */}
            {orderId && (
              <div className="text-xs text-gray-500 pt-2 border-t">
                رقم الطلب: #{orderId.slice(-8)}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
