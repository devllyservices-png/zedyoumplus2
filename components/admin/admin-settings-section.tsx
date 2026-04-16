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

export function AdminSettingsSection() {
  const {
    currencies,
    isSavingCurrencies,
    handleCurrencyFieldChange,
    handleSetDefaultCurrency,
    ensureBaseCurrencies,
    handleAddCustomCurrency,
    handleSaveCurrencies,
    subscriptionPlans,
    isSavingSubscriptionPlans,
    handleSubscriptionPlanFieldChange,
    handleSetDefaultSubscriptionPlan,
    handleToggleSubscriptionPlanActive,
    handleAddSubscriptionPlan,
    handleSaveSubscriptionPlans,
    syncSubscriptionPlanWithPayPal,
  } = useAdmin()

  return (
    <div className="space-y-6">
      <Card className="border-gray-700 bg-gray-800">
        <CardHeader>
          <CardTitle className="text-white">إعدادات النظام</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-400">
            إدارة إعدادات العملة واختيارات النظام الأخرى من هذه الصفحة.
          </p>
          <div className="grid grid-cols-1 gap-4">
            <Card className="border-gray-700 bg-gray-900">
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="text-base text-white">
                    إعدادات العملة
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-300 bg-gray-100 text-gray-900 hover:bg-white hover:text-black [&_svg]:text-gray-900"
                    type="button"
                    onClick={ensureBaseCurrencies}
                  >
                    تهيئة العملات الأساسية (EUR, DZD, USD)
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-400">
                  جميع الأسعار داخل النظام تعتمد على اليورو كعملة أساسية، ويمكن
                  تحويلها إلى الدينار الجزائري أو الدولار أو عملات أخرى حسب أسعار
                  الصرف التي يتم ضبطها هنا.
                </p>

                <div className="hidden lg:block">
                  <AdminTableScroll
                    className="max-h-none"
                    tableMinWidthClassName="min-w-[640px]"
                  >
                    <Table>
                      <TableHeader className="sticky top-0 z-10 bg-gray-900 shadow-[0_1px_0_0_rgb(31_41_55)]">
                        <TableRow className="border-gray-800 hover:bg-transparent">
                          <TableHead className="text-right text-gray-300">
                            الرمز
                          </TableHead>
                          <TableHead className="text-right text-gray-300">
                            الاسم
                          </TableHead>
                          <TableHead className="text-right text-gray-300">
                            سعر الصرف مقابل اليورو
                          </TableHead>
                          <TableHead className="text-center text-gray-300">
                            مفعّلة
                          </TableHead>
                          <TableHead className="text-center text-gray-300">
                            افتراضية
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currencies.map((currency, index) => (
                          <TableRow
                            key={`${currency.code}-${index}`}
                            className="border-gray-800/60"
                          >
                            <TableCell>
                              <input
                                className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-100"
                                value={currency.code}
                                placeholder="EUR"
                                onChange={(e) =>
                                  handleCurrencyFieldChange(
                                    index,
                                    "code",
                                    e.target.value.toUpperCase()
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <input
                                className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-100"
                                value={currency.name}
                                placeholder="Euro"
                                onChange={(e) =>
                                  handleCurrencyFieldChange(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <input
                                type="number"
                                step="0.0001"
                                className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-100"
                                value={currency.rate_to_eur}
                                onChange={(e) =>
                                  handleCurrencyFieldChange(
                                    index,
                                    "rate_to_eur",
                                    e.target.value
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  handleCurrencyFieldChange(
                                    index,
                                    "is_active",
                                    !currency.is_active
                                  )
                                }
                                className={`inline-flex h-8 min-w-[44px] items-center justify-center rounded-full text-xs ${
                                  currency.is_active
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-700 text-gray-300"
                                }`}
                              >
                                {currency.is_active ? "نعم" : "لا"}
                              </button>
                            </TableCell>
                            <TableCell className="text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  handleSetDefaultCurrency(currency.code)
                                }
                                className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-xs ${
                                  currency.is_default
                                    ? "bg-purple-600 text-white"
                                    : "border border-gray-700 bg-gray-800 text-gray-300"
                                }`}
                              >
                                {currency.is_default
                                  ? "افتراضية"
                                  : "تعيين كافتراضية"}
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AdminTableScroll>
                </div>

                <div className="grid grid-cols-1 gap-3 lg:hidden">
                  {currencies.map((currency, index) => (
                    <div
                      key={`${currency.code}-${index}-mobile`}
                      className="space-y-2 rounded-lg border border-gray-700 bg-gray-800 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          className="w-16 rounded border border-gray-700 bg-gray-900 px-2 py-1 text-center text-xs text-gray-100"
                          value={currency.code}
                          placeholder="EUR"
                          onChange={(e) =>
                            handleCurrencyFieldChange(
                              index,
                              "code",
                              e.target.value.toUpperCase()
                            )
                          }
                        />
                        <input
                          className="min-w-0 flex-1 rounded border border-gray-700 bg-gray-900 px-2 py-1 text-xs text-gray-100"
                          value={currency.name}
                          placeholder="Euro"
                          onChange={(e) =>
                            handleCurrencyFieldChange(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-400">
                          سعر الصرف مقابل اليورو
                        </label>
                        <input
                          type="number"
                          step="0.0001"
                          className="w-full rounded border border-gray-700 bg-gray-900 px-2 py-2 text-xs text-gray-100"
                          value={currency.rate_to_eur}
                          onChange={(e) =>
                            handleCurrencyFieldChange(
                              index,
                              "rate_to_eur",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleCurrencyFieldChange(
                              index,
                              "is_active",
                              !currency.is_active
                            )
                          }
                          className={`inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full px-2 py-2 text-xs ${
                            currency.is_active
                              ? "bg-green-600 text-white"
                              : "bg-gray-700 text-gray-300"
                          }`}
                        >
                          {currency.is_active ? "مفعّلة" : "غير مفعّلة"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleSetDefaultCurrency(currency.code)
                          }
                          className={`inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full px-2 py-2 text-xs ${
                            currency.is_default
                              ? "bg-purple-600 text-white"
                              : "border border-gray-700 bg-gray-800 text-gray-300"
                          }`}
                        >
                          {currency.is_default
                            ? "العملة الافتراضية"
                            : "تعيين كافتراضية"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-gray-800 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-gray-300 bg-gray-100 text-gray-900 hover:bg-white hover:text-black [&_svg]:text-gray-900"
                    onClick={handleAddCustomCurrency}
                  >
                    إضافة عملة مخصصة
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="bg-purple-600 px-4 text-white hover:bg-purple-700"
                    onClick={() => void handleSaveCurrencies()}
                    disabled={isSavingCurrencies || currencies.length === 0}
                  >
                    {isSavingCurrencies ? "جاري الحفظ..." : "حفظ إعدادات العملة"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-700 bg-gray-900">
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="text-base text-white">
                    إعدادات اشتراكات البائعين (PayPal)
                  </CardTitle>
                  <Button
                    type="button"
                    size="sm"
                    className="bg-purple-600 px-4 text-white hover:bg-purple-700"
                    onClick={handleAddSubscriptionPlan}
                  >
                    إضافة خطة جديدة
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-400">
                  تحكم في خطط اشتراك البائعين، مثل العرض الخاص 0.01 EUR لمدة 3 أشهر عبر PayPal.
                  يمكن تعيين خطة افتراضية واحدة فقط في كل مرة.
                </p>

                <AdminTableScroll
                  className="max-h-none"
                  tableMinWidthClassName="min-w-[720px]"
                >
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-gray-900 shadow-[0_1px_0_0_rgb(31_41_55)]">
                      <TableRow className="border-gray-800 hover:bg-transparent">
                        <TableHead className="text-right text-gray-300">
                          الاسم
                        </TableHead>
                        <TableHead className="text-right text-gray-300">
                          السعر (EUR)
                        </TableHead>
                        <TableHead className="text-right text-gray-300">
                          المدة (أشهر)
                        </TableHead>
                        <TableHead className="text-center text-gray-300">
                          مفعّلة
                        </TableHead>
                        <TableHead className="text-center text-gray-300">
                          افتراضية
                        </TableHead>
                        <TableHead className="text-center text-gray-300">
                          PayPal
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptionPlans.map((plan, index) => (
                        <TableRow
                          key={plan.id || `temp-${index}`}
                          className="border-gray-800/60"
                        >
                          <TableCell>
                            <input
                              className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-100"
                              value={plan.name}
                              placeholder="Special PayPal offer"
                              onChange={(e) =>
                                handleSubscriptionPlanFieldChange(
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                            />
                            <input
                              className="mt-1 w-full rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-300"
                              value={plan.description || ""}
                              placeholder="وصف الخطة (اختياري)"
                              onChange={(e) =>
                                handleSubscriptionPlanFieldChange(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <input
                              type="number"
                              step="0.01"
                              className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-100"
                              value={plan.price_eur}
                              onChange={(e) =>
                                handleSubscriptionPlanFieldChange(
                                  index,
                                  "price_eur",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <input
                              type="number"
                              min={1}
                              className="w-full rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-100"
                              value={plan.duration_months}
                              onChange={(e) =>
                                handleSubscriptionPlanFieldChange(
                                  index,
                                  "duration_months",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleSubscriptionPlanActive(plan.id)
                              }
                              className={`inline-flex h-8 min-w-[44px] items-center justify-center rounded-full text-xs ${
                                plan.is_active
                                  ? "bg-green-600 text-white"
                                  : "bg-gray-700 text-gray-300"
                              }`}
                            >
                              {plan.is_active ? "نعم" : "لا"}
                            </button>
                          </TableCell>
                          <TableCell className="text-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleSetDefaultSubscriptionPlan(plan.id)
                              }
                              className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-xs ${
                                plan.is_default
                                  ? "bg-purple-600 text-white"
                                  : "border border-gray-700 bg-gray-800 text-gray-300"
                              }`}
                            >
                              {plan.is_default ? "افتراضية" : "تعيين كافتراضية"}
                            </button>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-1 text-xs text-gray-300">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="border-gray-500 bg-gray-800 text-gray-100 hover:bg-gray-700"
                                onClick={() =>
                                  syncSubscriptionPlanWithPayPal(plan.id)
                                }
                                disabled={!plan.id}
                              >
                                مزامنة مع PayPal
                              </Button>
                              <div className="text-[10px] text-gray-400">
                                {plan.paypal_plan_id
                                  ? "متزامنة"
                                  : "غير متزامنة بعد"}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {subscriptionPlans.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <div className="py-6 text-center text-gray-300">
                              لا توجد خطط بعد. اضغط على \"إضافة خطة جديدة\" للبدء.
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </AdminTableScroll>

                <div className="mt-2 flex flex-wrap items-center justify-end gap-3 border-t border-gray-800 pt-2">
                  <Button
                    type="button"
                    size="sm"
                    className="bg-purple-600 px-4 text-white hover:bg-purple-700"
                    onClick={() => void handleSaveSubscriptionPlans()}
                    disabled={isSavingSubscriptionPlans}
                  >
                    {isSavingSubscriptionPlans
                      ? "جاري الحفظ..."
                      : "حفظ خطط الاشتراك"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
