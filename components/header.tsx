"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { user, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-lg"
          : "bg-white/95 backdrop-blur-sm border-b border-gray-100"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/images/logo-large.png"
              alt="شعار المنصة"
              width={120}
              height={40}
              className="hidden md:block transition-all duration-300 hover:scale-105"
            />
            <Image
              src="/images/logo-small.png"
              alt="شعار المنصة"
              width={40}
              height={40}
              className="md:hidden transition-all duration-300 hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8 space-x-reverse">
            <Link
              href="/services"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 relative group"
            >
              الخدمات
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/digital-products"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 relative group"
            >
              المنتجات الرقمية
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="#categories"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 relative group"
            >
              التصنيفات
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 relative group"
            >
              كيف تعمل المنصة
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 relative group"
            >
              تواصل معنا
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* User Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <>
                {user.userType === "seller" && (
                  <Link href="/services/create">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 bg-transparent hover:bg-blue-50 transition-all duration-300"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة خدمة
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button variant="outline" className="hover:bg-blue-50 transition-all duration-300 bg-transparent">
                    لوحة التحكم
                  </Button>
                </Link>
                <Button
                  onClick={logout}
                  variant="outline"
                  className="hover:bg-red-50 hover:text-red-600 transition-all duration-300 bg-transparent"
                >
                  تسجيل الخروج
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" className="hover:bg-blue-50 transition-all duration-300 bg-transparent">
                    تسجيل الدخول
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="btn-gradient text-white px-6 py-2 rounded-lg font-medium hover:scale-105 transition-all duration-300 shadow-lg">
                    سجّل الآن
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors duration-300"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 bg-white/95 backdrop-blur-md">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/services"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300"
              >
                الخدمات
              </Link>
              <Link
                href="/digital-products"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300"
              >
                المنتجات الرقمية
              </Link>
              <Link
                href="#categories"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300"
              >
                التصنيفات
              </Link>
              <Link
                href="#how-it-works"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300"
              >
                كيف تعمل المنصة
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300"
              >
                تواصل معنا
              </Link>

              {user ? (
                <>
                  {user.userType === "seller" && (
                    <Link href="/services/create">
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 bg-transparent hover:bg-blue-50 transition-all duration-300"
                      >
                        <Plus className="w-4 h-4" />
                        إضافة خدمة
                      </Button>
                    </Link>
                  )}
                  <Link href="/dashboard">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent hover:bg-blue-50 transition-all duration-300"
                    >
                      لوحة التحكم
                    </Button>
                  </Link>
                  <Button
                    onClick={logout}
                    variant="outline"
                    className="w-full bg-transparent hover:bg-red-50 hover:text-red-600 transition-all duration-300"
                  >
                    تسجيل الخروج
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent hover:bg-blue-50 transition-all duration-300"
                    >
                      تسجيل الدخول
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="btn-gradient text-white w-full font-medium hover:scale-105 transition-all duration-300 shadow-lg">
                      سجّل الآن
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
