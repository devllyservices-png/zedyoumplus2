"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react"
import { useTranslation } from "@/lib/i18n/hooks/useTranslation"

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <Image
              src="/images/logo-large.png"
              alt={t.header.logoAlt}
              width={120}
              height={40}
              className="mb-4 brightness-0 invert"
            />
            <p className="text-gray-300 leading-relaxed mb-6">
              {t.footer.description}
            </p>
            <div className="flex space-x-4 space-x-reverse">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6">{t.footer.quickLinks.title}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/services" className="text-gray-300 hover:text-white transition-colors">
                  {t.footer.quickLinks.services}
                </Link>
              </li>
              <li>
                <Link href="/digital-products" className="text-gray-300 hover:text-white transition-colors">
                  {t.footer.quickLinks.digitalProducts}
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-300 hover:text-white transition-colors">
                  {t.footer.quickLinks.howItWorks}
                </Link>
              </li>
              <li>
                <Link href="/become-seller" className="text-gray-300 hover:text-white transition-colors">
                  {t.footer.quickLinks.becomeSeller}
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-300 hover:text-white transition-colors">
                  {t.footer.quickLinks.support}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xl font-bold mb-6">{t.footer.legal.title}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors">
                  {t.footer.legal.terms}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  {t.footer.legal.privacy}
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-gray-300 hover:text-white transition-colors">
                  {t.footer.legal.refund}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-300 hover:text-white transition-colors">
                  {t.footer.legal.cookies}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-6">{t.footer.contact.title}</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">{t.footer.contact.email}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">{t.footer.contact.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-300">{t.footer.contact.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="text-center mb-6">
            <h4 className="text-lg font-semibold mb-4">{t.footer.paymentMethods.title}</h4>
            <div className="flex justify-center items-center gap-6 flex-wrap">
              <div className="bg-white rounded-lg p-3">
                <span className="text-blue-600 font-bold text-sm">{t.footer.paymentMethods.chargily}</span>
              </div>
              <div className="bg-white rounded-lg p-3">
                <span className="text-green-600 font-bold text-sm">{t.footer.paymentMethods.ccp}</span>
              </div>
              <div className="bg-white rounded-lg p-3">
                <span className="text-red-600 font-bold text-sm">{t.footer.paymentMethods.cib}</span>
              </div>
              <div className="bg-white rounded-lg p-3">
                <span className="text-blue-800 font-bold text-sm">{t.footer.paymentMethods.visa}</span>
              </div>
              <div className="bg-white rounded-lg p-3">
                <span className="text-red-500 font-bold text-sm">{t.footer.paymentMethods.mastercard}</span>
              </div>
              <div className="bg-white rounded-lg p-3">
                <span className="text-gray-700 font-bold text-sm">{t.footer.paymentMethods.bankTransfer}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">{t.footer.copyright}</p>
        </div>
      </div>
    </footer>
  )
}
