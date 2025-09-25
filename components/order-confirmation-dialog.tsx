"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, User, Package, AlertTriangle, Shield } from "lucide-react"
import Link from "next/link"

interface ServicePackage {
  id: string
  name: string
  price: number
  delivery_time: string
  revisions: string
  features: string[]
}

interface SellerProfile {
  display_name: string
  avatar_url?: string
  is_verified: boolean
}

interface OrderConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  serviceTitle: string
  serviceId: string
  selectedPackage: ServicePackage
  sellerProfile: SellerProfile
  sellerId: string
}

export default function OrderConfirmationDialog({
  isOpen,
  onClose,
  serviceTitle,
  serviceId,
  selectedPackage,
  sellerProfile,
  sellerId
}: OrderConfirmationDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false)

  const handleConfirmOrder = () => {
    setIsConfirming(true)
    // Redirect to checkout page with correct parameters
    window.location.href = `/checkout?serviceId=${serviceId}&package=${selectedPackage.name}&notes=&serviceTitle=${encodeURIComponent(serviceTitle)}&price=${selectedPackage.price}&sellerId=${sellerId}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            تأكيد الطلب
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Service Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{serviceTitle}</h3>
            
            {/* Package Info */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">{selectedPackage.name}</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {selectedPackage.price} دج
              </Badge>
            </div>

            {/* Delivery Time */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <Clock className="w-4 h-4" />
              <span>وقت التسليم: {selectedPackage.delivery_time}</span>
            </div>

            {/* Seller Info */}
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={sellerProfile.avatar_url || "/images/avatar-fallback.svg"} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                  {sellerProfile.display_name?.charAt(0) || "ب"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{sellerProfile.display_name}</span>
                  {sellerProfile.is_verified && (
                    <Shield className="w-3 h-3 text-green-600" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-700">
                  ⚠️ الرجاء التأكد من أن شروط هذه الخدمة تلبي احتياجاتك. يمكننا حمايتك فقط إذا قام البائع بخرق الشروط المتفق عليها.
                </p>
              </div>
            </div>
          </div>

          {/* Package Features */}
          {selectedPackage.features && selectedPackage.features.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">المميزات المتضمنة:</h4>
              <ul className="space-y-1">
                {selectedPackage.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="text-sm text-blue-800 flex items-center gap-2">
                    <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                    {feature}
                  </li>
                ))}
                {selectedPackage.features.length > 3 && (
                  <li className="text-xs text-blue-600">
                    +{selectedPackage.features.length - 3} مميزات أخرى
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isConfirming}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleConfirmOrder}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              disabled={isConfirming}
            >
              {isConfirming ? "جاري التحميل..." : "تأكيد الطلب"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
