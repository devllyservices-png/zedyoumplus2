"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Plus, User, LogOut, Bell, Settings } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useNotifications } from "@/contexts/notification-context"
import { NotificationsModal } from "@/components/notifications-modal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showNotificationsModal, setShowNotificationsModal] = useState(false)
  const { user, profile, logout } = useAuth()
  const { notifications, unreadCount, markAsRead } = useNotifications()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !(event.target as Element).closest('.user-menu')) {
        setShowUserMenu(false)
      }
      if (showNotifications && !(event.target as Element).closest('.notification-menu')) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu, showNotifications])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-lg"
          : "bg-transparent"
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
          <nav className="hidden lg:flex items-center gap-12">
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
                {user.role === "seller" && (
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
                
                {/* Notifications Button */}
                <div className="relative notification-menu">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-full hover:bg-gray-50 transition-all duration-300 cursor-pointer group"
                  >
                    <Bell className="w-6 h-6 text-gray-600 group-hover:text-gray-900 transition-colors duration-300" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">الإشعارات</h3>
                        <span className="text-sm text-gray-500">{unreadCount} غير مقروء</span>
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => {
                              if (notification.unread) {
                                markAsRead(notification.id)
                              }
                            }}
                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-r-4 ${
                              notification.unread 
                                ? 'border-blue-500 bg-blue-50/30' 
                                : 'border-transparent'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                notification.type === 'order' ? 'bg-green-500' :
                                notification.type === 'review' ? 'bg-yellow-500' :
                                notification.type === 'message' ? 'bg-blue-500' :
                                'bg-gray-500'
                              }`}></div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className={`text-sm font-medium ${
                                    notification.unread ? 'text-gray-900' : 'text-gray-700'
                                  }`}>
                                    {notification.title}
                                  </h4>
                                  <span className="text-xs text-gray-500">{notification.time}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="px-4 py-2 border-t border-gray-100">
                        <button 
                          onClick={() => {
                            setShowNotifications(false)
                            setShowNotificationsModal(true)
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                        >
                          عرض جميع الإشعارات
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* User Profile Dropdown */}
                <div className="relative user-menu">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="relative p-1 rounded-full hover:scale-105 transition-all duration-300 cursor-pointer group"
                  >
                    {/* Gradient circle indicator */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-violet-600 p-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                      <div className="w-full h-full rounded-full bg-white"></div>
                    </div>
                    
                    <Avatar className="w-10 h-10 relative z-10 ring-2 ring-white shadow-lg">
                      <AvatarImage src={profile?.avatar_url || "/images/avatar-fallback.svg"} alt={profile?.display_name || user.email} />
                      <AvatarFallback className="text-sm bg-gradient-to-br from-cyan-400 to-violet-600 text-white font-semibold">
                        {(profile?.display_name || user.email).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Role indicator dot */}
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      user.role === "seller"
                        ? "bg-green-500"
                        : user.role === "admin"
                          ? "bg-purple-500"
                          : "bg-blue-500"
                    }`}></div>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={profile?.avatar_url || "/images/avatar-fallback.svg"} alt={profile?.display_name || user.email} />
                            <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-violet-600 text-white">
                              {(profile?.display_name || user.email).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">{profile?.display_name || user.email.split('@')[0]}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-2">
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <User className="w-4 h-4" />
                          لوحة التحكم
                        </Link>
                        <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <User className="w-4 h-4" />
                          الملف الشخصي
                        </Link>
                        <button
                          onClick={() => {
                            logout()
                            setShowUserMenu(false)
                          }}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-right cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          تسجيل الخروج
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Mobile Notifications Button */}
            {user && (
              <div className="relative notification-menu">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-full hover:bg-gray-50 transition-all duration-300 cursor-pointer group"
                >
                  <Bell className="w-6 h-6 text-gray-600 group-hover:text-gray-900 transition-colors duration-300" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Mobile Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">الإشعارات</h3>
                      <span className="text-sm text-gray-500">{unreadCount} غير مقروء</span>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => {
                            if (notification.unread) {
                              markAsRead(notification.id)
                            }
                          }}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-r-4 ${
                            notification.unread 
                              ? 'border-blue-500 bg-blue-50/30' 
                              : 'border-transparent'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              notification.type === 'order' ? 'bg-green-500' :
                              notification.type === 'review' ? 'bg-yellow-500' :
                              notification.type === 'message' ? 'bg-blue-500' :
                              'bg-gray-500'
                            }`}></div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className={`text-sm font-medium ${
                                  notification.unread ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notification.title}
                                </h4>
                                <span className="text-xs text-gray-500">{notification.time}</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="px-4 py-2 border-t border-gray-100">
                      <button 
                        onClick={() => {
                          setShowNotifications(false)
                          setShowNotificationsModal(true)
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                      >
                        عرض جميع الإشعارات
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-300 cursor-pointer"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
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
                  {/* Mobile User Info */}
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyan-50 to-violet-50 rounded-lg mb-4 border border-cyan-100">
                    <div className="relative">
                      <Avatar className="w-14 h-14 ring-2 ring-white shadow-lg">
                        <AvatarImage src={profile?.avatar_url || "/images/avatar-fallback.svg"} alt={profile?.display_name || user.email} />
                        <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-violet-600 text-white font-semibold text-lg">
                          {(profile?.display_name || user.email).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Role indicator dot */}
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                        user.role === "seller"
                          ? "bg-green-500"
                          : user.role === "admin"
                            ? "bg-purple-500"
                            : "bg-blue-500"
                      }`}></div>
                    </div>
                    <div className="flex-1 text-right">
                      <div className="font-semibold text-gray-900 text-lg">{profile?.display_name || user.email.split('@')[0]}</div>
                      <div className="text-sm text-gray-600">{user.email}</div>
                      <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                        user.role === "seller"
                          ? "bg-green-100 text-green-800"
                          : user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                      }`}>
                        {user.role === "seller" ? "مقدم خدمة" : user.role === "admin" ? "مدير" : "مشتري"}
                      </div>
                    </div>
                  </div>


                  {user.role === "seller" && (
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
                  <Link href="/dashboard/profile">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent hover:bg-blue-50 transition-all duration-300"
                    >
                      الملف الشخصي
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

      {/* Notifications Modal */}
      <NotificationsModal 
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
      />
    </header>
  )
}
