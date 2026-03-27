"use client"

import { useAdmin } from "@/contexts/admin-context"
import { AdminTableScroll } from "@/components/admin/admin-table-scroll"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Eye, FileText, ShoppingBag } from "lucide-react"

export function AdminOrdersSection() {
  const {
    orders,
    ordersPage,
    ordersPageSize,
    ordersTotal,
    fetchOrders,
    handleOrderStatusChange,
    getStatusBadge,
    setSelectedOrder,
    setShowOrderDialog,
    testNotification,
  } = useAdmin()

  return (
    <Card className="border-gray-700 bg-gray-800">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-white">إدارة الطلبات</CardTitle>
          <Button
            type="button"
            onClick={() => void testNotification()}
            className="min-h-[44px] w-full bg-blue-600 text-white hover:bg-blue-700 sm:w-auto"
          >
            اختبار الإشعارات
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 lg:hidden">
          {orders.map((order) => {
            const statusInfo = getStatusBadge(order.status)
            const StatusIcon = statusInfo.icon
            return (
              <div
                key={order.id}
                className="space-y-3 rounded-lg bg-gray-700 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="mb-1 text-sm font-semibold text-white">
                      {order.services?.title || "خدمة غير محددة"}
                    </h3>
                    <p className="text-xs text-gray-400">{order.users?.email}</p>
                  </div>
                  <Badge className={`${statusInfo.className} shrink-0 text-xs`}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {statusInfo.text}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">
                    {order.amount.toLocaleString()} دج
                  </span>
                  <span className="text-gray-400">
                    {new Date(order.created_at).toLocaleDateString("ar-DZ")}
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge className="bg-blue-100 text-xs text-blue-800">
                    {order.payment_method === "bank_transfer"
                      ? "تحويل بنكي"
                      : order.payment_method === "card_payment"
                        ? "دفع بالبطاقة"
                        : order.payment_method === "cash"
                          ? "دفع نقدي"
                          : order.payment_method}
                  </Badge>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedOrder(order)
                        setShowOrderDialog(true)
                      }}
                      className="min-h-[40px] border-blue-500 bg-blue-900/20 px-3 text-xs text-blue-300 hover:bg-blue-600 hover:text-white"
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      التفاصيل
                    </Button>
                    {order.payment_proof_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open(order.payment_proof_url, "_blank")
                        }
                        className="min-h-[40px] border-green-500 bg-green-900/20 text-xs text-green-300 hover:bg-green-600 hover:text-white"
                      >
                        <FileText className="mr-1 h-3 w-3" />
                        الإيصال
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="hidden lg:block">
          <AdminTableScroll>
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-gray-800 shadow-[0_1px_0_0_rgb(55_65_81)]">
                <TableRow className="border-gray-700 hover:bg-transparent">
                  <TableHead className="text-right text-gray-300">
                    الخدمة
                  </TableHead>
                  <TableHead className="text-right text-gray-300">
                    المشتري
                  </TableHead>
                  <TableHead className="text-right text-gray-300">
                    المبلغ
                  </TableHead>
                  <TableHead className="text-right text-gray-300">
                    طريقة الدفع
                  </TableHead>
                  <TableHead className="text-right text-gray-300">
                    التاريخ
                  </TableHead>
                  <TableHead className="text-center text-gray-300">
                    الحالة
                  </TableHead>
                  <TableHead className="text-center text-gray-300">
                    الإجراءات
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const statusInfo = getStatusBadge(order.status)
                  const StatusIcon = statusInfo.icon
                  return (
                    <TableRow
                      key={order.id}
                      className="border-gray-700/50 hover:bg-gray-700/30"
                    >
                      <TableCell className="text-right">
                        <span className="text-sm font-semibold text-white">
                          {order.services?.title || "خدمة غير محددة"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-gray-300">
                        {order.users?.email}
                      </TableCell>
                      <TableCell className="font-semibold text-white">
                        {order.amount.toLocaleString()} دج
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-blue-100 text-xs text-blue-800">
                          {order.payment_method === "bank_transfer"
                            ? "تحويل بنكي"
                            : order.payment_method === "card_payment"
                              ? "دفع بالبطاقة"
                              : order.payment_method === "cash"
                                ? "دفع نقدي"
                                : order.payment_method}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {new Date(order.created_at).toLocaleDateString("ar-DZ")}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`${statusInfo.className} text-xs`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusInfo.text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <Select
                            value={order.status}
                            onValueChange={(value) =>
                              void handleOrderStatusChange(order.id, value)
                            }
                          >
                            <SelectTrigger className="h-8 w-32 border-gray-600 bg-gray-700 text-xs text-white data-[placeholder]:text-gray-300 [&_span]:text-white [&_svg]:text-gray-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="dark border-gray-600 bg-gray-800 text-white">
                              <SelectItem
                                value="pending"
                                className="text-white data-[highlighted]:bg-gray-600 data-[highlighted]:text-white focus:bg-gray-600 focus:text-white"
                              >
                                معلق
                              </SelectItem>
                              <SelectItem
                                value="in_progress"
                                className="text-white data-[highlighted]:bg-gray-600 data-[highlighted]:text-white focus:bg-gray-600 focus:text-white"
                              >
                                قيد التنفيذ
                              </SelectItem>
                              <SelectItem
                                value="completed"
                                className="text-white data-[highlighted]:bg-gray-600 data-[highlighted]:text-white focus:bg-gray-600 focus:text-white"
                              >
                                مكتمل
                              </SelectItem>
                              <SelectItem
                                value="cancelled"
                                className="text-white data-[highlighted]:bg-gray-600 data-[highlighted]:text-white focus:bg-gray-600 focus:text-white"
                              >
                                ملغي
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedOrder(order)
                              setShowOrderDialog(true)
                            }}
                            className="h-8 border-blue-500 bg-blue-900/20 px-3 text-xs text-blue-300 hover:bg-blue-600 hover:text-white"
                          >
                            <Eye className="mr-1 h-3 w-3" />
                            التفاصيل
                          </Button>
                          {order.payment_proof_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                window.open(order.payment_proof_url, "_blank")
                              }
                              className="h-8 border-green-500 bg-green-900/20 px-3 text-xs text-green-300 hover:bg-green-600 hover:text-white"
                            >
                              <FileText className="mr-1 h-3 w-3" />
                              الإيصال
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </AdminTableScroll>
        </div>

        {ordersTotal > ordersPageSize && (
          <div className="mt-4 flex flex-col gap-3 text-sm text-gray-300 sm:flex-row sm:items-center sm:justify-between">
            <span>
              الصفحة {ordersPage} من{" "}
              {Math.max(1, Math.ceil(ordersTotal / ordersPageSize))}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={ordersPage <= 1}
                className="min-h-[40px] border-gray-600 bg-gray-800 text-white shadow-none hover:bg-gray-700 hover:text-white [&_svg]:text-white"
                onClick={() => void fetchOrders(ordersPage - 1)}
              >
                السابق
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={
                  ordersPage >= Math.ceil(ordersTotal / ordersPageSize)
                }
                className="min-h-[40px] border-gray-600 text-gray-200 hover:bg-gray-700"
                onClick={() => void fetchOrders(ordersPage + 1)}
              >
                التالي
              </Button>
            </div>
          </div>
        )}

        {orders.length === 0 && (
          <div className="py-12 text-center">
            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-gray-500" />
            <p className="text-gray-400">لا توجد طلبات</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
