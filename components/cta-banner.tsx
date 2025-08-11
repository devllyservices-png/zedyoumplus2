import { Button } from "@/components/ui/button"

export function CTABanner() {
  return (
    <section className="py-20 gradient-brand">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            ابدأ الآن… الخدمة أو المنتج الذي تحتاجه أقرب إليك مما تتخيل
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            انضم إلى آلاف المستخدمين الذين يثقون في منصتنا لتلبية احتياجاتهم الرقمية
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-bold rounded-xl shadow-lg">
              سجّل مجانًا
            </Button>
            <Button
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-bold rounded-xl bg-transparent"
            >
              تعرف على المزيد
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-2">مجاني</div>
              <div className="text-white/80">التسجيل</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">آمن</div>
              <div className="text-white/80">الدفع</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">سريع</div>
              <div className="text-white/80">التسليم</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-white/80">الدعم</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
