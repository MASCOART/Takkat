"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, Search, ShoppingCart, User, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// This would typically come from your auth service
const isLoggedIn = false

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="border-b" dir="rtl">
      <div className="container flex h-20 items-center justify-between px-4 md:px-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm">
          <Link href="/necklaces" className="text-foreground hover:text-muted-foreground transition-colors">
            القلائد
          </Link>
          <Link href="/earrings" className="text-foreground hover:text-muted-foreground transition-colors">
            الأقراط
          </Link>
          <Link href="/bracelets" className="text-foreground hover:text-muted-foreground transition-colors">
            الأساور
          </Link>
          <Link href="/rings" className="text-foreground hover:text-muted-foreground transition-colors">
            الخواتم
          </Link>
        </nav>

        {/* Logo */}
        <div className="absolute right-1/2 translate-x-1/2">
          <Link href="/" className="flex flex-col items-center">
            <Image
              src="https://media.discordapp.net/attachments/1317885123361767445/1342092183158784020/9887e892-5770-45e7-8db4-b7e276d4e069.jpg?ex=67b8603f&is=67b70ebf&hm=c81468b8c175680327dfd7c3a0c4a4ad7a27bf967c222f33903b9e934c2429e8&=&format=webp&width=449&height=449"
              alt="Takkat"
              width={120}
              height={40}
              priority
            />
          </Link>
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center space-x-4">
          <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="w-full">
              <SheetHeader>
                <SheetTitle>البحث</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <Input placeholder="ابحث عن المنتجات..." className="w-full" />
              </div>
            </SheetContent>
          </Sheet>

          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -left-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white">
                  0
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[90vw] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>سلة التسوق</SheetTitle>
              </SheetHeader>
              <div className="mt-8">
                <p className="text-center text-muted-foreground">سلة التسوق فارغة</p>
              </div>
            </SheetContent>
          </Sheet>
          {isLoggedIn ? (
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          ) : (
            <Button size="sm" className="hidden md:inline-flex bg-black">
              ابدأ الآن
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn("fixed inset-0 z-50 bg-background md:hidden", isMobileMenuOpen ? "block" : "hidden")}>
        <div className="container h-full px-4 pb-6 pt-20">
          <nav className="flex flex-col space-y-4">
            <Link href="/rings" className="text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              الخواتم
            </Link>
            <Link href="/bracelets" className="text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              الأساور
            </Link>
            <Link href="/earrings" className="text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              الأقراط
            </Link>
            <Link href="/necklaces" className="text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              القلائد
            </Link>
          </nav>

          {!isLoggedIn && (
            <div className="mt-6">
              <Button className="w-full">ابدأ الآن</Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-4"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <span className="sr-only">إغلاق القائمة</span>
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  )
}

