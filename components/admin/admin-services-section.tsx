"use client"

import { useAdmin } from "@/contexts/admin-context"
import { AdminTableScroll } from "@/components/admin/admin-table-scroll"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Eye, Package, Trash2 } from "lucide-react"
import { Price } from "@/components/price"

export function AdminServicesSection() {
  const { services, handleDeleteService } = useAdmin()

  return (
    <Card className="border-gray-700 bg-gray-800">
      <CardHeader>
        <CardTitle className="text-white">إدارة الخدمات</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 lg:hidden">
          {services.map((service) => (
            <div key={service.id} className="space-y-3 rounded-lg bg-gray-700 p-4">
              <div className="flex items-start gap-3">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-600">
                  {service.service_images && service.service_images.length > 0 ? (
                    <img
                      src={service.service_images[0].image_url}
                      alt={service.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="mb-1 text-sm font-semibold text-white">
                    {service.title}
                  </h3>
                  <p className="mb-2 line-clamp-2 text-xs text-gray-400">
                    {service.description}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-green-400">
                      {service.service_packages &&
                      service.service_packages.length > 0
                        ? (<Price amountDzd={service.service_packages[0].price} />)
                        : "غير محدد"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {service.users?.email}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.open(`/services/${service.id}`, "_blank")
                          }
                          className="h-9 min-w-[44px] border-blue-500 bg-blue-900/20 px-2 text-blue-300 hover:bg-blue-600 hover:text-white"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteService(service)}
                          className="h-9 min-w-[44px] border-red-500 bg-red-900/20 px-2 text-red-300 hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
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
                  <TableHead className="text-right text-gray-300">الصورة</TableHead>
                  <TableHead className="text-right text-gray-300">الخدمة</TableHead>
                  <TableHead className="text-right text-gray-300">
                    مقدم الخدمة
                  </TableHead>
                  <TableHead className="w-32 text-right text-gray-300">السعر</TableHead>
                  <TableHead className="text-right text-gray-300">
                    تاريخ الإنشاء
                  </TableHead>
                  <TableHead className="w-40 text-center text-gray-300">
                    الإجراءات
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow
                    key={service.id}
                    className="border-gray-700/50 hover:bg-gray-700/30"
                  >
                    <TableCell>
                      <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-600">
                        {service.service_images && service.service_images.length > 0 ? (
                          <img
                            src={service.service_images[0].image_url}
                            alt={service.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[240px] text-right">
                      <div className="font-semibold text-white">{service.title}</div>
                      <div className="line-clamp-2 text-xs text-gray-400">
                        {service.description}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-sm text-gray-300">{service.users?.email}</div>
                      {service.users?.profiles?.display_name && (
                        <div className="text-xs text-gray-400">
                          {service.users.profiles.display_name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-400">
                      {service.service_packages && service.service_packages.length > 0
                        ? (<Price amountDzd={service.service_packages[0].price} />)
                        : "غير محدد"}
                    </TableCell>
                    <TableCell className="text-gray-400">
                      {new Date(service.created_at).toLocaleDateString("ar-DZ")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            window.open(`/services/${service.id}`, "_blank")
                          }
                          className="h-8 border-blue-500 bg-blue-900/20 px-3 text-xs text-blue-300 hover:bg-blue-600 hover:text-white"
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          عرض
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteService(service)}
                          className="h-8 border-red-500 bg-red-900/20 px-3 text-xs text-red-300 hover:bg-red-600 hover:text-white"
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          حذف
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AdminTableScroll>
        </div>

        {services.length === 0 && (
          <div className="py-12 text-center">
            <Package className="mx-auto mb-4 h-12 w-12 text-gray-500" />
            <p className="text-gray-400">لا توجد خدمات</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
