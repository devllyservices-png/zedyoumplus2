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
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "@/lib/i18n/hooks/useTranslation"

export function HomeHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showNotificationsModal, setShowNotificationsModal] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const { user, profile, logout } = useAuth()
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const { t, language, setLanguage } = useTranslation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
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
      if (showLanguageMenu && !(event.target as Element).closest('.language-menu')) {
        setShowLanguageMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserMenu, showNotifications, showLanguageMenu])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            {isScrolled ? (
              <>
                <Image
                  src="/images/logo-large.png"
                  alt={t.header.logoAlt}
                  width={120}
                  height={40}
                  className="hidden md:block transition-all duration-300 hover:scale-105"
                />
                <Image
                  src="/images/logo-small.png"
                  alt={t.header.logoAlt}
                  width={40}
                  height={40}
                  className="md:hidden transition-all duration-300 hover:scale-105"
                />
              </>
            ) : (
              <>
                <Image
                  src="/images/logo-large.png"
                  alt={t.header.logoAlt}
                  width={120}
                  height={40}
                  className="hidden md:block transition-all duration-300 hover:scale-105 brightness-0 invert"
                />
                <Image
                  src="/images/logo-small.png"
                  alt={t.header.logoAlt}
                  width={40}
                  height={40}
                  className="md:hidden transition-all duration-300 hover:scale-105 brightness-0 invert"
                />
              </>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-12">
            <Link
              href="/services"
              className={`font-medium transition-colors duration-300 relative group ${
                isScrolled 
                  ? "text-gray-700 hover:text-blue-600" 
                  : "text-white/90 hover:text-white"
              }`}
            >
              {t.header.nav.services}
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                isScrolled ? "bg-blue-600" : "bg-white"
              }`}></span>
            </Link>
            <Link
              href="/digital-products"
              className={`font-medium transition-colors duration-300 relative group ${
                isScrolled 
                  ? "text-gray-700 hover:text-blue-600" 
                  : "text-white/90 hover:text-white"
              }`}
            >
              {t.header.nav.digitalProducts}
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                isScrolled ? "bg-blue-600" : "bg-white"
              }`}></span>
            </Link>
            <Link
              href="/how-it-works"
              className={`font-medium transition-colors duration-300 relative group ${
                isScrolled 
                  ? "text-gray-700 hover:text-blue-600" 
                  : "text-white/90 hover:text-white"
              }`}
            >
              {t.header.nav.howItWorks}
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                isScrolled ? "bg-blue-600" : "bg-white"
              }`}></span>
            </Link>
            <Link
              href="/contact"
              className={`font-medium transition-colors duration-300 relative group ${
                isScrolled 
                  ? "text-gray-700 hover:text-blue-600" 
                  : "text-white/90 hover:text-white"
              }`}
            >
              {t.header.nav.contact}
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                isScrolled ? "bg-blue-600" : "bg-white"
              }`}></span>
            </Link>
          </nav>

          {/* User Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Language Switcher */}
            <div className="relative language-menu">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 cursor-pointer group border-2 shadow-sm ${
                  isScrolled 
                    ? "bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:border-blue-400" 
                    : "bg-white/10 hover:bg-white/20 border-white/40 text-white backdrop-blur-sm hover:border-white/60"
                }`}
                title={language === "fr" ? "Français" : language === "en" ? "English" : "العربية"}
              >
                <span className={`text-sm font-medium ${isScrolled ? "text-gray-700" : "text-white"}`}>
                  {language === "fr" ? "FR" : language === "en" ? "EN" : "AR"}
                </span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-300 ${showLanguageMenu ? "rotate-180" : ""} ${isScrolled ? "text-gray-600" : "text-white"}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Language Dropdown */}
              {showLanguageMenu && (
                <div className="absolute left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      setLanguage("fr")
                      setShowLanguageMenu(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                      language === "fr"
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 font-semibold border-r-4 border-blue-500"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex-1 text-left">FR - Français</span>
                    {language === "fr" && (
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage("en")
                      setShowLanguageMenu(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                      language === "en"
                        ? "bg-gradient-to-r from-red-50 to-red-100 text-red-700 font-semibold border-r-4 border-red-500"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex-1 text-left">EN - English</span>
                    {language === "en" && (
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage("ar")
                      setShowLanguageMenu(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                      language === "ar"
                        ? "bg-gradient-to-r from-green-50 to-green-100 text-green-700 font-semibold border-r-4 border-green-500"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex-1 text-right">AR - العربية</span>
                    {language === "ar" && (
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <>
                {user.role === "seller" && (
                  <Link href="/services/create">
                    <Button
                      variant="outline"
                      className={`flex items-center gap-2 transition-all duration-300 ${
                        isScrolled 
                          ? "bg-transparent hover:bg-blue-50 border-gray-300 text-gray-700" 
                          : "bg-white/20 hover:bg-white/30 border-white/30 text-white"
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      {t.header.actions.addService}
                    </Button>
                  </Link>
                )}
                
                {/* Notifications Button */}
                <div className="relative notification-menu">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative p-2 rounded-full transition-all duration-300 cursor-pointer group ${
                      isScrolled 
                        ? "hover:bg-gray-50" 
                        : "hover:bg-white/20"
                    }`}
                  >
                    <Bell className={`w-6 h-6 transition-colors duration-300 ${
                      isScrolled 
                        ? "text-gray-600 group-hover:text-gray-900" 
                        : "text-white/90 group-hover:text-white"
                    }`} />
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
                        <h3 className="font-semibold text-gray-900">{t.header.notifications.title}</h3>
                        <span className="text-sm text-gray-500">{unreadCount} {t.header.notifications.unread}</span>
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
                          {t.header.notifications.viewAll}
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
                          {t.header.actions.dashboard}
                        </Link>
                        <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                          <User className="w-4 h-4" />
                          {t.header.actions.profile}
                        </Link>
                        <button
                          onClick={() => {
                            logout()
                            setShowUserMenu(false)
                          }}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-right cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          {t.header.actions.logout}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button 
                    variant="outline" 
                    className={`transition-all duration-300 ${
                      isScrolled 
                        ? "hover:bg-blue-50 bg-transparent border-gray-300 text-gray-700" 
                        : "hover:bg-white/20 bg-transparent border-white/30 text-white"
                    }`}
                  >
                    {t.header.actions.login}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    className={`px-6 py-2 rounded-lg font-medium hover:scale-105 transition-all duration-300 shadow-lg ${
                      isScrolled 
                        ? "btn-gradient text-white" 
                        : "bg-white/20 hover:bg-white/30 text-white border border-white/30"
                    }`}
                  >
                    {t.header.actions.register}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Mobile Language Switcher */}
            <div className="relative language-menu">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 cursor-pointer group border-2 shadow-sm ${
                  isScrolled 
                    ? "bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:border-blue-400" 
                    : "bg-white/10 hover:bg-white/20 border-white/40 text-white backdrop-blur-sm hover:border-white/60"
                }`}
              >
                <span className={`text-sm font-medium ${isScrolled ? "text-gray-700" : "text-white"}`}>
                  {language === "fr" ? "FR" : language === "en" ? "EN" : "AR"}
                </span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-300 ${showLanguageMenu ? "rotate-180" : ""} ${isScrolled ? "text-gray-600" : "text-white"}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Mobile Language Dropdown */}
              {showLanguageMenu && (
                <div className="absolute left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      setLanguage("fr")
                      setShowLanguageMenu(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                      language === "fr"
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 font-semibold border-r-4 border-blue-500"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex-1 text-left">FR - Français</span>
                    {language === "fr" && (
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage("en")
                      setShowLanguageMenu(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                      language === "en"
                        ? "bg-gradient-to-r from-red-50 to-red-100 text-red-700 font-semibold border-r-4 border-red-500"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex-1 text-left">EN - English</span>
                    {language === "en" && (
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setLanguage("ar")
                      setShowLanguageMenu(false)
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                      language === "ar"
                        ? "bg-gradient-to-r from-green-50 to-green-100 text-green-700 font-semibold border-r-4 border-green-500"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex-1 text-right">AR - العربية</span>
                    {language === "ar" && (
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Notifications Button */}
            {user && (
              <div className="relative notification-menu">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2 rounded-full transition-all duration-300 cursor-pointer group ${
                    isScrolled 
                      ? "hover:bg-gray-50" 
                      : "hover:bg-white/20"
                  }`}
                >
                  <Bell className={`w-6 h-6 transition-colors duration-300 ${
                    isScrolled 
                      ? "text-gray-600 group-hover:text-gray-900" 
                      : "text-white/90 group-hover:text-white"
                  }`} />
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
                      <h3 className="font-semibold text-gray-900">{t.header.notifications.title}</h3>
                      <span className="text-sm text-gray-500">{unreadCount} {t.header.notifications.unread}</span>
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
                        {t.header.notifications.viewAll}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 transition-colors duration-300 cursor-pointer ${
                isScrolled 
                  ? "text-gray-600 hover:text-gray-900" 
                  : "text-white/90 hover:text-white"
              }`}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden"
            >
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                exit={{ y: -20 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="py-6 bg-white/90 backdrop-blur-md border border-white/20 shadow-2xl rounded-3xl mx-2"
              >
                <nav className="flex flex-col space-y-1">
                  {/* Navigation Links */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="space-y-1 mb-6"
                  >
                    {[
                      { href: "/services", label: t.header.nav.services },
                      { href: "/digital-products", label: t.header.nav.digitalProducts },
                      { href: "/how-it-works", label: t.header.nav.howItWorks },
                      { href: "/contact", label: t.header.nav.contact }
                    ].map((item, index) => (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 font-medium transition-all duration-300 rounded-lg mx-2"
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* User Section */}
                  {user ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                      className="border-t border-gray-200 pt-6"
                    >
                      {/* User Info Card */}
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl mb-4 mx-2 border border-blue-100">
                        <div className="relative">
                          <Avatar className="w-12 h-12 ring-2 ring-white shadow-md">
                            <AvatarImage src={profile?.avatar_url || "/images/avatar-fallback.svg"} alt={profile?.display_name || user.email} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
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
                        </div>
                        <div className="flex-1 text-right">
                          <div className="font-semibold text-gray-900">{profile?.display_name || user.email.split('@')[0]}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                          <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                            user.role === "seller"
                              ? "bg-green-100 text-green-800"
                              : user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                          }`}>
                            {user.role === "seller" ? t.header.user.seller : user.role === "admin" ? t.header.user.admin : t.header.user.buyer}
                          </div>
                        </div>
                      </div>

                      {/* User Actions */}
                      <div className="space-y-2 mx-2">
                        {user.role === "seller" && (
                          <Link href="/services/create" onClick={() => setIsMenuOpen(false)}>
                            <Button
                              variant="outline"
                              className="w-full flex items-center justify-center gap-2 bg-white/50 hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800 transition-all duration-300"
                            >
                              <Plus className="w-4 h-4" />
                              {t.header.actions.addService}
                            </Button>
                          </Link>
                        )}
                        <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                          <Button
                            variant="outline"
                            className="w-full bg-white/50 hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-800 transition-all duration-300"
                          >
                            {t.header.actions.dashboard}
                          </Button>
                        </Link>
                        <Link href="/dashboard/profile" onClick={() => setIsMenuOpen(false)}>
                          <Button
                            variant="outline"
                            className="w-full bg-white/50 hover:bg-gray-50 border-gray-200 text-gray-700 hover:text-gray-800 transition-all duration-300"
                          >
                            {t.header.actions.profile}
                          </Button>
                        </Link>
                        <Button
                          onClick={() => {
                            logout()
                            setIsMenuOpen(false)
                          }}
                          variant="outline"
                          className="w-full bg-white/50 hover:bg-red-50 border-red-200 text-red-600 hover:text-red-700 transition-all duration-300"
                        >
                          {t.header.actions.logout}
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                      className="border-t border-gray-200 pt-6 space-y-3 mx-2"
                    >
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                        <Button
                          variant="outline"
                          className="w-full bg-white/50 hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800 transition-all duration-300"
                        >
                          {t.header.actions.login}
                        </Button>
                      </Link>
                      <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium transition-all duration-300 shadow-lg">
                          {t.header.actions.register}
                        </Button>
                      </Link>
                    </motion.div>
                  )}
                </nav>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notifications Modal */}
      <NotificationsModal 
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
      />
    </header>
  )
}
