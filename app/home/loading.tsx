export default function Loading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Header skeleton */}
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="h-6 w-28 bg-gray-200 rounded" />
          <div className="hidden md:flex items-center gap-4">
            <div className="h-4 w-16 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
            <div className="h-9 w-24 bg-gray-200 rounded" />
          </div>
          <div className="h-9 w-9 bg-gray-200 rounded-full" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16 py-10">
        {/* HeroSection skeleton */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-gray-200 rounded" />
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-5/6 bg-gray-200 rounded" />
            <div className="h-11 w-40 bg-gray-200 rounded" />
          </div>
          <div className="h-64 w-full bg-gray-200 rounded" />
        </section>

        {/* CategoriesSection skeleton */}
        <section className="space-y-6">
          <div className="h-7 w-44 bg-gray-200 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-20 bg-gray-200 rounded" />
            ))}
          </div>
        </section>

        {/* HowItWorks skeleton */}
        <section className="space-y-6">
          <div className="h-7 w-48 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="p-6 border rounded-lg space-y-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full" />
                <div className="h-5 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-5/6 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </section>

        {/* FeaturedServices skeleton */}
        <section className="space-y-6">
          <div className="h-7 w-56 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="border rounded-lg overflow-hidden">
                <div className="h-40 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 w-3/4 bg-gray-200 rounded" />
                  <div className="h-4 w-5/6 bg-gray-200 rounded" />
                  <div className="h-9 w-24 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DigitalProducts skeleton */}
        <section className="space-y-6">
          <div className="h-7 w-60 bg-gray-200 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="border rounded-lg overflow-hidden">
                <div className="h-32 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 w-2/3 bg-gray-200 rounded" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* WhyChooseUs skeleton */}
        <section className="space-y-6">
          <div className="h-7 w-48 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="p-6 border rounded-lg space-y-3">
                <div className="h-6 w-6 bg-gray-200 rounded" />
                <div className="h-5 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials skeleton */}
        <section className="space-y-6">
          <div className="h-7 w-44 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="p-6 border rounded-lg space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-5/6 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner skeleton */}
        <section className="rounded-2xl border p-8 lg:p-10 flex items-center justify-between gap-6">
          <div className="space-y-4 w-full">
            <div className="h-6 w-1/2 bg-gray-200 rounded" />
            <div className="h-4 w-2/3 bg-gray-200 rounded" />
          </div>
          <div className="hidden md:block h-10 w-32 bg-gray-200 rounded" />
        </section>
      </main>

      {/* Footer skeleton */}
      <footer className="mt-16 border-t">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-4">
          <div className="h-5 w-36 bg-gray-200 rounded" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="space-y-2">
                <div className="h-4 w-20 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-200 rounded" />
                <div className="h-3 w-16 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}


