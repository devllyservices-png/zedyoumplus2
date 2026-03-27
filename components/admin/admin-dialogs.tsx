"use client"

import { useAdmin } from "@/contexts/admin-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FileText, ExternalLink } from "lucide-react"

export function AdminDialogs() {
  const {
    suspendingUser,
    showSuspendDialog,
    setShowSuspendDialog,
    confirmSuspendUser,
    selectedOrder,
    showOrderDialog,
    setShowOrderDialog,
    deletingService,
    showDeleteServiceDialog,
    setShowDeleteServiceDialog,
    confirmDeleteService,
    getStatusBadge,
  } = useAdmin()

  return (
    <>
      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent className="dark border-gray-700 bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">
              {suspendingUser?.suspended
                ? "إلغاء تعليق الحساب"
                : "تعليق الحساب"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {suspendingUser?.suspended
                ? `هل أنت متأكد من إلغاء تعليق حساب ${suspendingUser.profiles?.display_name || suspendingUser.email}؟`
                : `هل أنت متأكد من تعليق حساب ${suspendingUser?.profiles?.display_name || suspendingUser?.email}؟`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSuspendDialog(false)}
              className="border-gray-500 bg-gray-700 text-white hover:bg-gray-600 hover:text-white [&_svg]:text-white"
            >
              إلغاء
            </Button>
            <Button
              onClick={() => void confirmSuspendUser()}
              className={
                suspendingUser?.suspended
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {suspendingUser?.suspended ? "إلغاء التعليق" : "تعليق الحساب"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="dark max-w-2xl border-gray-700 bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">تفاصيل الطلب</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-gray-700 p-4">
                  <h3 className="mb-2 font-semibold text-white">
                    معلومات الطلب
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">رقم الطلب:</span>
                      <span className="text-white">
                        #{selectedOrder.id.slice(0, 8)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">المبلغ:</span>
                      <span className="font-semibold text-white">
                        {selectedOrder.amount.toLocaleString()} دج
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">طريقة الدفع:</span>
                      <span className="text-white">
                        {selectedOrder.payment_method === "bank_transfer"
                          ? "تحويل بنكي"
                          : selectedOrder.payment_method === "card_payment"
                            ? "دفع بالبطاقة"
                            : selectedOrder.payment_method === "cash"
                              ? "دفع نقدي"
                              : selectedOrder.payment_method}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">التاريخ:</span>
                      <span className="text-white">
                        {new Date(selectedOrder.created_at).toLocaleDateString(
                          "ar-DZ"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-700 p-4">
                  <h3 className="mb-2 font-semibold text-white">الحالة</h3>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const statusInfo = getStatusBadge(selectedOrder.status)
                      const StatusIcon = statusInfo.icon
                      return (
                        <Badge className={`${statusInfo.className} text-sm`}>
                          <StatusIcon className="mr-1 h-4 w-4" />
                          {statusInfo.text}
                        </Badge>
                      )
                    })()}
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-gray-700 p-4">
                <h3 className="mb-3 font-semibold text-white">معلومات الخدمة</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-400">اسم الخدمة:</span>
                    <p className="font-medium text-white">
                      {selectedOrder.services?.title || "خدمة غير محددة"}
                    </p>
                  </div>
                  {selectedOrder.services?.description && (
                    <div>
                      <span className="text-sm text-gray-400">الوصف:</span>
                      <p className="text-sm text-white">
                        {selectedOrder.services.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-gray-700 p-4">
                  <h3 className="mb-3 font-semibold text-white">المشتري</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">البريد الإلكتروني:</span>
                      <p className="text-white">{selectedOrder.users?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-700 p-4">
                  <h3 className="mb-3 font-semibold text-white">
                    مقدم الخدمة
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">البريد الإلكتروني:</span>
                      <p className="text-white">
                        {selectedOrder.sellers?.email || "غير محدد"}
                      </p>
                    </div>
                    {selectedOrder.sellers?.profiles?.display_name && (
                      <div>
                        <span className="text-gray-400">الاسم:</span>
                        <p className="text-white">
                          {selectedOrder.sellers.profiles.display_name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedOrder.additional_notes && (
                <div className="rounded-lg bg-gray-700 p-4">
                  <h3 className="mb-3 font-semibold text-white">
                    ملاحظات إضافية
                  </h3>
                  <p className="text-sm text-white">
                    {selectedOrder.additional_notes}
                  </p>
                </div>
              )}

              {selectedOrder.payment_proof_url && (
                <div className="rounded-lg bg-gray-700 p-4">
                  <h3 className="mb-3 font-semibold text-white">إيصال الدفع</h3>
                  <Button
                    onClick={() =>
                      window.open(selectedOrder.payment_proof_url, "_blank")
                    }
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    عرض إيصال الدفع
                    <ExternalLink className="mr-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowOrderDialog(false)}
              className="border-gray-500 bg-gray-700 text-white hover:bg-gray-600 hover:text-white [&_svg]:text-white"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showDeleteServiceDialog}
        onOpenChange={setShowDeleteServiceDialog}
      >
        <DialogContent className="dark border-gray-700 bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">حذف الخدمة</DialogTitle>
            <DialogDescription className="text-gray-400">
              هل أنت متأكد من حذف الخدمة &quot;{deletingService?.title}&quot;؟ هذا
              الإجراء لا يمكن التراجع عنه.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteServiceDialog(false)}
              className="border-gray-500 bg-gray-700 text-white hover:bg-gray-600 hover:text-white [&_svg]:text-white"
            >
              إلغاء
            </Button>
            <Button
              onClick={() => void confirmDeleteService()}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              حذف الخدمة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
