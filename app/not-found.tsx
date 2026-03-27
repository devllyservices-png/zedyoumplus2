import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-2xl">
        <div className="rounded-3xl border border-gray-200 bg-white/90 backdrop-blur-sm shadow-2xl p-8 sm:p-12 text-center">
          <Link href="/" className="inline-flex justify-center mb-6">
            <Image
              src="/images/logo-large.png"
              alt="ZedYoum+"
              width={170}
              height={56}
              className="h-auto w-auto"
              priority
            />
          </Link>

          <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 mb-5">
            404 - Page Not Found
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">عذراً، هذه الصفحة غير موجودة</h1>
          <p className="text-gray-600 leading-7 mb-3">
            يبدو أن الرابط الذي حاولت الوصول إليه غير صحيح، أو أن الصفحة تم نقلها أو حذفها.
          </p>
          <p className="text-gray-600 leading-7 mb-8">
            يمكنك العودة إلى الصفحة الرئيسية ومتابعة تصفح الخدمات والمتاجر بسهولة.
          </p>

          <div className="flex justify-center">
            <Link href="/">
              <Button className="btn-gradient text-white px-6 py-3 h-auto text-base font-semibold">
                <Home className="w-4 h-4 ml-2" />
                العودة إلى الصفحة الرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

