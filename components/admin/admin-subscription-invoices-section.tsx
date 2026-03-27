"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminTableScroll } from "@/components/admin/admin-table-scroll"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, FileText, XCircle } from "lucide-react"

type AdminSubscriptionInvoiceRow = {
  id: string
  created_at: string
  amount_dzd: number | string
  duration_months: number
  status: string
  payment_method: string | null
  payment_proof_url: string | null
  period_start_at: string | null
  period_end_at: string | null
  seller?: {
    id: string
    email: string | null
    displayName: string | null
    avatarUrl: string | null
  }
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

export function AdminSubscriptionInvoicesSection() {
  const [loading, setLoading] = useState(false)
  const [invoices, setInvoices] = useState<AdminSubscriptionInvoiceRow[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 })
  const [statusFilter, setStatusFilter] = useState<string>("pending")

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [proofOpen, setProofOpen] = useState(false)
  const [proofUrl, setProofUrl] = useState<string | null>(null)

  const fetchInvoices = async (page: number, limit: number, status: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (status) params.set("status", status)
      const res = await fetch(`/api/admin/subscription-invoices?${params.toString()}`, { credentials: "include" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "فشل جلب الفواتير")
      setInvoices(data.invoices || [])
      setPagination(data.pagination || { page, limit, total: 0, pages: 1 })
    } catch (e) {
      console.error(e)
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchInvoices(pagination.page, pagination.limit, statusFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const canApprove = (inv: AdminSubscriptionInvoiceRow) => {
    const isProviderPayment = inv.payment_method === "card_payment" || inv.payment_method === "paypal"
    return inv.status !== "approved" && inv.status !== "rejected" && (!isProviderPayment || inv.status === "paid")
  }

  const canReject = (inv: AdminSubscriptionInvoiceRow) => {
    return inv.status !== "rejected" && inv.status !== "approved"
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
      if (!res.ok) throw new Error(data?.error || "فشل الموافقة")
      await fetchInvoices(pagination.page, pagination.limit, statusFilter)
    } catch (e: any) {
      alert(e?.message || "فشل الموافقة")
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
      if (!res.ok) throw new Error(data?.error || "فشل الرفض")
      await fetchInvoices(pagination.page, pagination.limit, statusFilter)
    } catch (e: any) {
      alert(e?.message || "فشل الرفض")
    } finally {
      setActionLoadingId(null)
    }
  }

  const limit = pagination.limit
  const page = pagination.page

  return (
    <Card className="border-gray-700 bg-gray-800">
      <CardHeader>
        <CardTitle className="text-white">الفواتير - اشتراكات</CardTitle>
        <p className="text-gray-300 text-sm mt-1">وافق/ارفض الطلبات. الموافقة فقط تُفعّل وتمدد مدة الاشتراك.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {["pending", "paid", "approved", "rejected"].map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                className={statusFilter === s ? "bg-blue-600 hover:bg-blue-700 text-white" : "border-gray-600 text-gray-200 hover:bg-gray-700"}
                onClick={() => setStatusFilter(s)}
              >
                {s}
              </Button>
            ))}
          </div>
          <div className="text-sm text-gray-300">
            صفحة {page} من {pagination.pages}
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-300">جاري التحميل...</div>
        ) : (
          <AdminTableScroll>
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-gray-800 shadow-[0_1px_0_0_rgb(55_65_81)]">
                <TableRow className="border-gray-700 hover:bg-transparent">
                  <TableHead>الرقم</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>البائع</TableHead>
                  <TableHead className="text-center">المبلغ</TableHead>
                  <TableHead>طريقة الدفع</TableHead>
                  <TableHead className="text-center">الحالة</TableHead>
                  <TableHead>الفترة</TableHead>
                  <TableHead className="text-center">إيصال</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => {
                  const b = statusBadge(inv.status)
                  const _canApprove = canApprove(inv)
                  const _canReject = canReject(inv)
                  return (
                    <TableRow key={inv.id} className="border-gray-700/50 hover:bg-gray-700/30">
                      <TableCell className="font-mono text-xs">{inv.id.slice(0, 8)}...</TableCell>
                      <TableCell className="text-gray-200">{formatArDate(inv.created_at)}</TableCell>
                      <TableCell className="text-gray-200">
                        <div className="text-sm font-semibold">{inv.seller?.displayName || inv.seller?.email || "—"}</div>
                        <div className="text-xs text-gray-400">{inv.seller?.email ? inv.seller?.email : ""}</div>
                      </TableCell>
                      <TableCell className="text-center text-gray-200 font-semibold">
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
                            onClick={() => {
                              setProofUrl(inv.payment_proof_url)
                              setProofOpen(true)
                            }}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            عرض
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
                            disabled={!_canApprove || actionLoadingId === inv.id}
                            className="h-8 border-green-500 bg-green-900/20 text-green-300 hover:bg-green-600 hover:text-white disabled:opacity-50"
                            onClick={() => void approveInvoice(inv.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            موافقة
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!_canReject || actionLoadingId === inv.id}
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
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <div className="py-10 text-center text-gray-300">لا توجد بيانات</div>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </AdminTableScroll>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            className="border-gray-600 text-gray-200 hover:bg-gray-700"
            disabled={page <= 1}
            onClick={() => {
              const next = page - 1
              setPagination((p) => ({ ...p, page: next }))
              void fetchInvoices(next, limit, statusFilter)
            }}
          >
            السابق
          </Button>
          <Button
            variant="outline"
            className="border-gray-600 text-gray-200 hover:bg-gray-700"
            disabled={page >= pagination.pages}
            onClick={() => {
              const next = page + 1
              setPagination((p) => ({ ...p, page: next }))
              void fetchInvoices(next, limit, statusFilter)
            }}
          >
            التالي
          </Button>
        </div>
      </CardContent>

      <Dialog open={proofOpen} onOpenChange={setProofOpen}>
        <DialogContent className="dark border-gray-700 bg-gray-800 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white">إيصال الدفع</DialogTitle>
            <DialogDescription className="text-gray-400">يمكنك فتح الإيصال في تبويب جديد.</DialogDescription>
          </DialogHeader>
          <div className="w-full">
            {proofUrl ? (
              // Use iframe to preview images/PDFs.
              <iframe
                src={proofUrl}
                title="payment proof"
                className="w-full h-[70vh] rounded-md border border-gray-700 bg-white"
              />
            ) : null}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="border-gray-500 bg-gray-700 text-white hover:bg-gray-600"
              onClick={() => (proofUrl ? window.open(proofUrl, "_blank") : null)}
              disabled={!proofUrl}
            >
              فتح في تبويب جديد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

