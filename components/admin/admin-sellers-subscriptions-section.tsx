"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminTableScroll } from "@/components/admin/admin-table-scroll"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileText, CheckCircle, XCircle, Clock } from "lucide-react"

type AdminSellerSubscriptionRow = {
  sellerId: string
  email: string
  displayName: string | null
  avatarUrl: string | null
  isActive: boolean
  activeEndsAt: string | null
  latestEndsAt: string | null
  hasPendingInvoice: boolean
}

type AdminSubscriptionInvoiceRow = {
  id: string
  created_at: string
  amount_dzd: number | string
  duration_months: number
  status: string
  payment_method: string | null
  payment_proof_url: string | null
  approved_at: string | null
  paid_at: string | null
  rejected_at: string | null
  period_start_at: string | null
  period_end_at: string | null
}

function formatArDate(d: string | null | undefined) {
  if (!d) return "—"
  try {
    return new Date(d).toLocaleDateString("ar-DZ")
  } catch {
    return "—"
  }
}

function statusBadge(status: string) {
  const s = status || ""
  if (s === "approved") return { className: "bg-green-100 text-green-800 border-green-200", text: "approved" }
  if (s === "rejected") return { className: "bg-red-100 text-red-800 border-red-200", text: "rejected" }
  if (s === "paid") return { className: "bg-blue-100 text-blue-800 border-blue-200", text: "paid" }
  return { className: "bg-yellow-100 text-yellow-800 border-yellow-200", text: "pending" }
}

export function AdminSellersSubscriptionsSection() {
  const [sellers, setSellers] = useState<AdminSellerSubscriptionRow[]>([])
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null)
  const [sellerInvoices, setSellerInvoices] = useState<AdminSubscriptionInvoiceRow[]>([])
  const [invoicesLoading, setInvoicesLoading] = useState(false)

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const loadSellers = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/sellers/subscriptions", { credentials: "include" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "فشل جلب البائعين")
      setSellers(data.sellers || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const loadSellerInvoices = async (sellerId: string) => {
    setInvoicesLoading(true)
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}/subscription-invoices?page=1&limit=50`, {
        credentials: "include",
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "فشل جلب الفواتير")
      setSellerInvoices(data.invoices || [])
    } catch (e) {
      console.error(e)
      setSellerInvoices([])
    } finally {
      setInvoicesLoading(false)
    }
  }

  useEffect(() => {
    void loadSellers()
  }, [])

  const onViewInvoices = (sellerId: string) => {
    setSelectedSellerId(sellerId)
    setDialogOpen(true)
    void loadSellerInvoices(sellerId)
  }

  const approveInvoice = async (invoiceId: string) => {
    setActionLoadingId(invoiceId)
    try {
      const res = await fetch(`/api/admin/subscription-invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
        credentials: "include",
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "فشل في الموافقة")
      if (selectedSellerId) await loadSellerInvoices(selectedSellerId)
      await loadSellers()
    } catch (e: any) {
      alert(e?.message || "فشل في الموافقة")
    } finally {
      setActionLoadingId(null)
    }
  }

  const rejectInvoice = async (invoiceId: string) => {
    setActionLoadingId(invoiceId)
    try {
      const res = await fetch(`/api/admin/subscription-invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
        credentials: "include",
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "فشل في الرفض")
      if (selectedSellerId) await loadSellerInvoices(selectedSellerId)
      await loadSellers()
    } catch (e: any) {
      alert(e?.message || "فشل في الرفض")
    } finally {
      setActionLoadingId(null)
    }
  }

  const selectedSeller = useMemo(() => sellers.find((s) => s.sellerId === selectedSellerId) || null, [sellers, selectedSellerId])

  return (
    <Card className="border-gray-700 bg-gray-800">
      <CardHeader>
        <CardTitle className="text-white">اشتراكات البائعين</CardTitle>
        <p className="text-gray-300 text-sm mt-1">
          راقب انتهاء الاشتراك ووافق على فواتير الاشتراك لتفعيل المتاجر.
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-10 text-center text-gray-300">جاري التحميل...</div>
        ) : (
          <AdminTableScroll>
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-gray-800 shadow-[0_1px_0_0_rgb(55_65_81)]">
                <TableRow className="border-gray-700 hover:bg-transparent">
                  <TableHead>البائع</TableHead>
                  <TableHead className="text-center">الاشتراك النشط</TableHead>
                  <TableHead className="text-center">آخر انتهاء</TableHead>
                  <TableHead className="text-center">معلّق</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sellers.map((s) => (
                  <TableRow key={s.sellerId} className="border-gray-700/50 hover:bg-gray-700/30">
                    <TableCell>
                      <div>
                        <div className="text-sm font-semibold text-white">{s.displayName || s.email}</div>
                        <div className="text-xs text-gray-400">{s.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {s.isActive ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-gray-200">{formatArDate(s.latestEndsAt)}</TableCell>
                    <TableCell className="text-center">
                      {s.hasPendingInvoice ? (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
                      ) : (
                        <Badge className="bg-transparent text-gray-400 border border-gray-600">—</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-blue-500 bg-blue-900/20 text-blue-300 hover:bg-blue-600 hover:text-white"
                        onClick={() => onViewInvoices(s.sellerId)}
                      >
                        <FileText className="mr-1 h-3 w-3" />
                        عرض الفواتير
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {sellers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="py-10 text-center text-gray-300">لا توجد بيانات</div>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </AdminTableScroll>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="dark max-w-4xl border-gray-700 bg-gray-800 overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-white">
              فواتير البائع: {selectedSeller?.displayName || selectedSeller?.email || "—"}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              وافق/ارفض الطلبات. عند الموافقة يتم تفعيل المتجر وتمديد مدة الاشتراك.
            </DialogDescription>
          </DialogHeader>

          {invoicesLoading ? (
            <div className="py-6 text-center text-gray-300">جاري تحميل الفواتير...</div>
          ) : (
            <div className="space-y-4">
              <AdminTableScroll tableMinWidthClassName="min-w-[900px]">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-gray-800 shadow-[0_1px_0_0_rgb(55_65_81)]">
                    <TableRow className="border-gray-700 hover:bg-transparent">
                      <TableHead>الرقم</TableHead>
                      <TableHead>التاريخ</TableHead>
                      <TableHead className="text-center">المبلغ</TableHead>
                      <TableHead>طريقة الدفع</TableHead>
                      <TableHead className="text-center">الحالة</TableHead>
                      <TableHead>الفترة</TableHead>
                      <TableHead className="text-center">إيصال</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sellerInvoices.map((inv) => {
                      const b = statusBadge(inv.status)
                      const isProviderPayment =
                        inv.payment_method === "card_payment" || inv.payment_method === "paypal"
                      const canApprove =
                        inv.status !== "approved" &&
                        inv.status !== "rejected" &&
                        (!isProviderPayment || inv.status === "paid")
                      const canReject = inv.status !== "rejected" && inv.status !== "approved"
                      return (
                        <TableRow key={inv.id} className="border-gray-700/50 hover:bg-gray-700/30">
                          <TableCell className="font-mono text-xs">{inv.id.slice(0, 8)}...</TableCell>
                          <TableCell className="text-gray-200">{formatArDate(inv.created_at)}</TableCell>
                          <TableCell className="text-center text-gray-200">
                            {Number(inv.amount_dzd || 0).toLocaleString()} دج
                          </TableCell>
                          <TableCell className="text-gray-200">{inv.payment_method || "—"}</TableCell>
                          <TableCell className="text-center">
                            <Badge className={b.className}>{b.text}</Badge>
                          </TableCell>
                          <TableCell className="text-gray-200">
                            {inv.period_start_at && inv.period_end_at
                              ? `${formatArDate(inv.period_start_at)} - ${formatArDate(inv.period_end_at)}`
                              : "—"}
                          </TableCell>
                          <TableCell className="text-center">
                            {inv.payment_proof_url ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-gray-500 bg-transparent text-gray-200 hover:bg-gray-700"
                                onClick={() => window.open(inv.payment_proof_url || "#", "_blank")}
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                إيصال
                              </Button>
                            ) : (
                              <Badge className="bg-transparent text-gray-400 border border-gray-600">—</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!canApprove || actionLoadingId === inv.id}
                                className="h-8 border-green-500 bg-green-900/20 text-green-300 hover:bg-green-600 hover:text-white disabled:opacity-50"
                                onClick={() => void approveInvoice(inv.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                موافقة
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!canReject || actionLoadingId === inv.id}
                                className="h-8 border-red-500 bg-red-900/20 text-red-300 hover:bg-red-600 hover:text-white disabled:opacity-50"
                                onClick={() => void rejectInvoice(inv.id)}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                رفض
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {sellerInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <div className="py-10 text-center text-gray-300">لا توجد فواتير</div>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </AdminTableScroll>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-gray-500 bg-gray-700 text-white hover:bg-gray-600">
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

