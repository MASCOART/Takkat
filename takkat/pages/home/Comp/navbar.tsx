"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, Search, ShoppingCart, User, X, Trash2, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase" // Adjust the import path based on your Firebase setup

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  selectedColor: string
  selectedSize: string
  selectedImageUrl: string
  selectedQuantity: number
}

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [user, setUser] = useState<any>(null) // Use a more specific type if possible
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)

  useEffect(() => {
    const savedCartItems = localStorage.getItem("cartItems")
    if (savedCartItems) {
      setCartItems(JSON.parse(savedCartItems))
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
      } else {
        setUser(null)
      }
    })

    return () => unsubscribe()
  }, [])

  const removeFromCart = (id: string) => {
    const updatedCart = cartItems.filter((item) => item.id !== id)
    setCartItems(updatedCart)
    localStorage.setItem("cartItems", JSON.stringify(updatedCart))
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.selectedQuantity, 0)
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setUser(null)
    } catch (error) {
      console.error("Error signing out: ", error)
    }
  }

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
          {/* Navigation links */}
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
                  {cartItems.reduce((total, item) => total + item.selectedQuantity, 0)}
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[90vw] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>سلة التسوق</SheetTitle>
              </SheetHeader>
              <div className="mt-8">
                {cartItems.length === 0 ? (
                  <p className="text-center text-muted-foreground">سلة التسوق فارغة</p>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 rtl:space-x-reverse">
                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="flex-1 text-right">
                          <h3 className="font-semibold">{item.name}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {item.selectedColor && (
                              <span className="flex items-center gap-1 text-sm px-2 py-1 bg-gray-100 rounded-full">
                                <span
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: item.selectedColor }}
                                ></span>
                                {item.selectedColor}
                              </span>
                            )}
                            {item.selectedSize && (
                              <span className="text-sm px-2 py-1 bg-gray-100 rounded-full">{item.selectedSize}</span>
                            )}
                          </div>
                          <p className="text-sm mt-1">
                            الكمية: {item.selectedQuantity} x ₪{(item.price || 0).toFixed(2)}
                          </p>
                        </div>
                        <div className="relative w-16 h-16 rounded-md overflow-hidden">
                          <Image
                            src={item.selectedImageUrl || "/placeholder.svg"}
                            alt={item.name}
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <SheetFooter className="mt-8">
                <div className="w-full space-y-4">
                  <div className="flex justify-between">
                    <span className="font-semibold">المجموع:</span>
                    <span>₪{getTotalPrice().toFixed(2)}</span>
                  </div>
                  <Button className="w-full bg-black" onClick={() => setIsCartOpen(false)}>
                    عرض السلة
                  </Button>
                  <Button className="w-full bg-black" disabled={cartItems.length === 0}>
                    الدفع
                  </Button>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {user ? (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                <User className="h-5 w-5" />
              </Button>
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700">{user.email}</div>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="inline-block h-4 w-4 mr-2" />
                      الإعدادات
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="inline-block h-4 w-4 mr-2" />
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button size="sm" className="hidden md:inline-flex bg-black">
              <Link href="/auth/login" className="text-foreground hover:text-muted-foreground transition-colors no-underline text-white">
                ابدأ الآن
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn("fixed inset-0 z-50 bg-background md:hidden", isMobileMenuOpen ? "block" : "hidden")}>
        <div className="container h-full px-4 pb-6 pt-20">
          <nav className="flex flex-col space-y-4">
            <Button className="bg-black">
              <Link href="/Home" className="text-foreground hover:text-muted-foreground transition-colors no-underline text-white">
                الصفحة الرئيسية
              </Link>
            </Button>
          </nav>

          {!user && (
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