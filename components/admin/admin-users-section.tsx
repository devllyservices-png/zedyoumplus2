"use client"

import { useAdmin } from "@/contexts/admin-context"
import { AdminTableScroll } from "@/components/admin/admin-table-scroll"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Users } from "lucide-react"

export function AdminUsersSection() {
  const { users, handleSuspendUser, getAvatarUrl } = useAdmin()

  return (
    <Card className="border-gray-700 bg-gray-800">
      <CardHeader>
        <CardTitle className="text-white">إدارة المستخدمين</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 lg:hidden">
          {users.map((user) => (
            <div key={user.id} className="space-y-3 rounded-lg bg-gray-700 p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={getAvatarUrl(user)}
                    alt={user.profiles?.display_name || user.email}
                    onError={(e) => {
                      e.currentTarget.src = "/images/avatar-fallback.svg"
                    }}
                  />
                  <AvatarFallback className="bg-purple-600 text-white">
                    {(user.profiles?.display_name || user.email)
                      .charAt(0)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-white">
                    {user.profiles?.display_name || user.email}
                  </h3>
                  <p className="text-xs text-gray-400">{user.email}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge
                      className={
                        user.role === "seller"
                          ? "bg-green-100 text-xs text-green-800"
                          : user.role === "admin"
                            ? "bg-purple-100 text-xs text-purple-800"
                            : "bg-blue-100 text-xs text-blue-800"
                      }
                    >
                      {user.role === "seller"
                        ? "مقدم خدمة"
                        : user.role === "admin"
                          ? "مدير"
                          : "مشتري"}
                    </Badge>
                    <Badge
                      className={
                        user.suspended
                          ? "bg-red-100 text-xs text-red-800"
                          : "bg-green-100 text-xs text-green-800"
                      }
                    >
                      {user.suspended ? "معلق" : "نشط"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm text-gray-300">
                  {user.role === "seller"
                    ? `الأرباح: ${(user.totalEarnings || 0).toLocaleString()} دج`
                    : `الإنفاق: ${(user.totalSpent || 0).toLocaleString()} دج`}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!user.suspended}
                    onCheckedChange={() => handleSuspendUser(user)}
                    className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600"
                    style={{ direction: "ltr" }}
                  />
                  <span className="text-xs text-gray-400">
                    {user.suspended ? "معلق" : "نشط"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden lg:block">
          <AdminTableScroll>
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-gray-800 shadow-[0_1px_0_0_rgb(55_65_81)]">
                <TableRow className="border-gray-700 hover:bg-transparent">
                  <TableHead className="text-right text-gray-300">
                    المستخدم
                  </TableHead>
                  <TableHead className="text-right text-gray-300">
                    النوع
                  </TableHead>
                  <TableHead className="text-right text-gray-300">
                    المالية
                  </TableHead>
                  <TableHead className="text-right text-gray-300">
                    تاريخ الانضمام
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
                {users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-gray-700/50 hover:bg-gray-700/30"
                  >
                    <TableCell className="text-right">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={getAvatarUrl(user)}
                            alt={user.profiles?.display_name || user.email}
                            onError={(e) => {
                              e.currentTarget.src = "/images/avatar-fallback.svg"
                            }}
                          />
                          <AvatarFallback className="bg-purple-600 text-sm text-white">
                            {(user.profiles?.display_name || user.email)
                              .charAt(0)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {user.profiles?.display_name || user.email}
                          </div>
                          <div className="text-xs text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.role === "seller"
                            ? "bg-green-100 text-xs text-green-800"
                            : user.role === "admin"
                              ? "bg-purple-100 text-xs text-purple-800"
                              : "bg-blue-100 text-xs text-blue-800"
                        }
                      >
                        {user.role === "seller"
                          ? "مقدم خدمة"
                          : user.role === "admin"
                            ? "مدير"
                            : "مشتري"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {user.role === "seller"
                        ? `الأرباح: ${(user.totalEarnings || 0).toLocaleString()} دج`
                        : `الإنفاق: ${(user.totalSpent || 0).toLocaleString()} دج`}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {new Date(user.created_at).toLocaleDateString("ar-DZ")}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={
                          user.suspended
                            ? "bg-red-100 text-xs text-red-800"
                            : "bg-green-100 text-xs text-green-800"
                        }
                      >
                        {user.suspended ? "معلق" : "نشط"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={!user.suspended}
                          onCheckedChange={() => handleSuspendUser(user)}
                          className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600"
                          style={{ direction: "ltr" }}
                        />
                        <span className="min-w-[40px] text-xs text-gray-400">
                          {user.suspended ? "معلق" : "نشط"}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AdminTableScroll>
        </div>

        {users.length === 0 && (
          <div className="py-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-gray-500" />
            <p className="text-gray-400">لا يوجد مستخدمين</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
