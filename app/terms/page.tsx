"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useTranslation } from "@/lib/i18n/hooks/useTranslation"

export default function TermsPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl font-bold text-gray-900">
                {t.footer.legal.terms}
              </CardTitle>
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                {t.register.backToHome}
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-lg max-w-none">
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">1. قبول الشروط</h2>
                  <p className="text-base leading-7">
                    باستخدامك هذه المنصة، فإنك توافق على الالتزام بجميع الشروط والأحكام الواردة هنا.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">2. الخدمات المقدمة</h2>
                  <p className="text-base leading-7">
                    توفر المنصة خدمات رقمية/استشارية/تجارية حسب وصفها، ولا تتحمل مسؤولية استخدام غير مشروع لهذه الخدمات.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. حساب المستخدم</h2>
                  <ul className="list-disc list-inside space-y-2 text-base leading-7 mr-4">
                    <li>يجب على المستخدم تقديم معلومات صحيحة وكاملة عند التسجيل.</li>
                    <li>يتحمل المستخدم مسؤولية سرية بيانات الدخول الخاصة به.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">4. القيود</h2>
                  <p className="text-base leading-7">
                    يُمنع استخدام المنصة لأي نشاط غير قانوني أو يضر بحقوق الآخرين.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">5. المسؤولية</h2>
                  <p className="text-base leading-7">
                    المنصة غير مسؤولة عن أي أضرار مباشرة أو غير مباشرة ناتجة عن استخدام الخدمات.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">6. تعديل الشروط</h2>
                  <p className="text-base leading-7">
                    تحتفظ المنصة بحق تعديل هذه الشروط في أي وقت، ويُعتبر استمرار الاستخدام موافقة على التعديلات.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">7. تفعيل حساب مقدم الخدمة</h2>
                  <p className="text-base leading-7">
                    يتم تفعيل حساب مقدم الخدمة في المنصة بعد دفعه للمستحقات في أجل لا يتعدى 12 ساعة.
                  </p>
                </section>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center">
                آخر تحديث: {new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
