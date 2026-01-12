"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useTranslation } from "@/lib/i18n/hooks/useTranslation"

export default function PrivacyPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-3xl font-bold text-gray-900">
                {t.footer.legal.privacy}
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">1. سرية المعلومات</h2>
                  <p className="text-base leading-7">
                    المعلومات المقدمة تعتبر سرية بشكل صارم.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">2. استخدام المعلومات</h2>
                  <p className="text-base leading-7">
                    تُستخدم فقط لأغراض التحقق والتسجيل.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">3. مشاركة البيانات</h2>
                  <p className="text-base leading-7">
                    لن يتم مشاركة أي بيانات مع أطراف أخرى دون موافقة مسبقة منك.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">4. معايير حماية البيانات</h2>
                  <p className="text-base leading-7">
                    المنصة تلتزم بالمعايير الأوروبية وشمال إفريقيا لحماية البيانات.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">5. حقوق المستخدم</h2>
                  <p className="text-base leading-7">
                    لديك الحق في طلب حذف أو تعديل بياناتك في أي وقت.
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
