import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { CategoriesSection } from "@/components/categories-section"
import { HowItWorks } from "@/components/how-it-works"
import { ServicesCarousel } from "@/components/services-carousel"
import { DigitalProducts } from "@/components/digital-products"
import { WhyChooseUs } from "@/components/why-choose-us"
import { Testimonials } from "@/components/testimonials"
import { CTABanner } from "@/components/cta-banner"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <CategoriesSection />
        <HowItWorks />
        <ServicesCarousel />
        <DigitalProducts />
        <WhyChooseUs />
        <Testimonials />
        <CTABanner />
      </main>
      <Footer />
    </div>
  )
}
