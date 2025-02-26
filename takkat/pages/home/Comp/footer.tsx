"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, PhoneIcon as WhatsApp, MapPin, Phone, Mail, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function Footer() {
  const [email, setEmail] = useState("")

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log("Subscribing email:", email)
    setEmail("")
  }

  return (
    <footer className="
    bg-gray-700 text-white no-underline" dir="rtl">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and About Section */}
          <div className="space-y-4">
            <Link href="/" className="block">
              <Image
                src="https://media.discordapp.net/attachments/1317885123361767445/1342599938533752903/Untitled-1.png?ex=67ba3921&is=67b8e7a1&hm=98fe8fde511d902f31405bf3e1aba735dfafc0603edef9ad959b183856a44ef6&=&format=webp&quality=lossless&width=997&height=543"
                alt="Takkat"
                width={120}
                height={40}
                className="invert"
              />
            </Link>
            <p className="text-gray-400 text-sm no-underline">
              نحن نقدم مجموعة متميزة من المجوهرات والإكسسوارات الفاخرة. تسوق معنا واكتشف الجمال في كل قطعة.
            </p>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                <WhatsApp className="h-5 w-5" />
                <span className="sr-only">WhatsApp</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 no-underline">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-white transition-colors inline-flex items-center no-underline"
                >
                  <ChevronRight className="h-4 w-4 ml-1 no-underline" />
                  من نحن
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-policy"
                  className="text-gray-400 hover:text-white transition-colors inline-flex items-center no-underline"
                >
                  <ChevronRight className="h-4 w-4 ml-1" />
                  سياسة الشحن
                </Link>
              </li>
              <li>
                <Link
                  href="/return-policy"
                  className="text-gray-400 hover:text-white transition-colors inline-flex items-center no-underline"
                >
                  <ChevronRight className="h-4 w-4 ml-1" />
                  سياسة الإرجاع
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-gray-400 hover:text-white transition-colors inline-flex items-center no-underline"
                >
                  <ChevronRight className="h-4 w-4 ml-1" />
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-conditions"
                  className="text-gray-400 hover:text-white transition-colors inline-flex items-center no-underline"
                >
                  <ChevronRight className="h-4 w-4 ml-1" />
                  الشروط والأحكام
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">تواصل معنا</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 ml-2 mt-1 flex-shrink-0" />
                <span className="text-gray-400">شارع الملك عبدالله، عمان، الأردن</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 ml-2 flex-shrink-0" />
                <Link href="tel:+962791234567" className="text-gray-400 hover:text-white transition-colors no-underline">
                  +962 79 123 4567
                </Link>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 ml-2 flex-shrink-0" />
                <Link href="mailto:info@takkat.com" className="text-gray-400 hover:text-white transition-colors no-underline">
                  info@takkat.com
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">النشرة البريدية</h3>
            <p className="text-gray-400 text-sm mb-4">اشترك في نشرتنا البريدية للحصول على آخر العروض والتحديثات</p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <Input
                type="email"
                placeholder="البريد الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400"
                required
              />
              <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200">
                اشتراك
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 center">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 center">
            <p className="text-gray-400 text-sm text-center md:text-right center">
              © {new Date().getFullYear()} Takkat. جميع الحقوق محفوظة
            </p>
          
          </div>
        </div>
      </div>
    </footer>
  )
}

