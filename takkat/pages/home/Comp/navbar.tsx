"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, Search, ShoppingCart, User, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { useRouter } from "next/navigation"

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

interface Color {
  name: string
  imageUrl: string
}

interface Product {
  id: string
  name: string
  sku: string
  price: number
  description: string
  colors: Color[]
  sizes: string[]
  salePrice?: number
}

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [user, setUser] = useState<any>(null)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchedProduct, setSearchedProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentColorIndex, setCurrentColorIndex] = useState(0)
  const router = useRouter()

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

  const handleSearch = async () => {
    if (searchQuery.length !== 8) {
      setError("الرجاء إدخال رقم SKU صحيح مكون من 8 أحرف")
      return
    }

    setIsLoading(true)
    setError(null)
    setSearchedProduct(null)
    setCurrentColorIndex(0)

    try {
      const productsRef = collection(db, "products")
      const q = query(productsRef, where("sku", "==", searchQuery))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const productDoc = querySnapshot.docs[0]
        const productData = { id: productDoc.id, ...productDoc.data() } as Product
        setSearchedProduct(productData)
      } else {
        setError(`لم يتم العثور على منتج برقم SKU "${searchQuery}"`)
      }
    } catch (err) {
      console.error("Error fetching product:", err)
      setError("حدث خطأ أثناء البحث عن المنتج. الرجاء المحاولة مرة أخرى.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNextColor = () => {
    if (searchedProduct) {
      setCurrentColorIndex((prevIndex) => (prevIndex + 1) % searchedProduct.colors.length)
    }
  }

  const handlePrevColor = () => {
    if (searchedProduct) {
      setCurrentColorIndex(
        (prevIndex) => (prevIndex - 1 + searchedProduct.colors.length) % searchedProduct.colors.length,
      )
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
        <nav className="hidden md:flex items-center space-x-6 text-sm">{/* Navigation links */}</nav>

        {/* Logo */}
        <div className="absolute right-1/2 translate-x-1/2">
          <Link href="/Home" className="flex flex-col items-center">
            <Image
              src="https://media.discordapp.net/attachments/1317885123361767445/1342263249562767420/image_1.png?ex=67b8ff90&is=67b7ae10&hm=6b888129c37ef561b5bd17a8bfb44550d367916bb58cbdf13954e7431bbe2a35&=&format=webp&quality=lossless&width=449&height=449"
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
            <SheetContent side="top" className="w-full max-w-2xl mx-auto">
              <SheetHeader>
                <SheetTitle>البحث عن منتج</SheetTitle>
              </SheetHeader>
              <div className="mt-4 flex items-center">
                <Input
                  placeholder="أدخل رقم SKU (8 أحرف)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toUpperCase())}
                  className="flex-grow ml-2"
                />
                <Button className="bg-black" onClick={handleSearch} disabled={isLoading}>
                  بحث
                </Button>
              </div>
              {isLoading && <p className="mt-4 text-center">جاري البحث...</p>}
              {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
              {searchedProduct && (
                <div className="mt-6 p-4 border rounded-lg">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative w-full md:w-1/3">
                      <div className="aspect-square relative overflow-hidden rounded-lg">
                        <Image
                          src={searchedProduct.colors[currentColorIndex]?.imageUrl || "/placeholder.svg"}
                          alt={searchedProduct.name}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                      {searchedProduct.colors.length > 1 && (
                        <div className="flex justify-between mt-2">
                          <Button variant="outline" size="sm" onClick={handlePrevColor}>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleNextColor}>
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{searchedProduct.name}</h3>
                      <p className="text-sm mb-2">رقم SKU: {searchedProduct.sku}</p>
                      <div className="mb-2">
                        {searchedProduct.salePrice ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-red-600">₪{searchedProduct.salePrice}</span>
                            <span className="text-sm text-gray-500 line-through">₪{searchedProduct.price}</span>
                            <span className="text-xs text-red-600">
                              (خصم{" "}
                              {Math.round(
                                ((searchedProduct.price - searchedProduct.salePrice) / searchedProduct.price) * 100,
                              )}
                              %)
                            </span>
                          </div>
                        ) : (
                          <span className="text-xl font-bold">₪{searchedProduct.price}</span>
                        )}
                      </div>
                      <p className="text-sm mb-4">{searchedProduct.description}</p>
                      {searchedProduct.sizes.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold mb-2">المقاسات المتاحة:</h4>
                          <div className="flex flex-wrap gap-2">
                            {searchedProduct.sizes.map((size) => (
                              <span key={size} className="px-2 py-1 bg-gray-100 rounded-md text-sm">
                                {size}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <Button className="bg-black" onClick={() => router.push(`/home/Comp/product/${searchedProduct.id}`)}>عرض تفاصيل المنتج</Button>
                    </div>
                  </div>
                </div>
              )}
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
                          <X className="h-4 w-4" />
                        </Button>
                        <div className="flex-1 text-right">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm">
                            الكمية: {item.selectedQuantity} x ₪{item.price.toFixed(2)}
                          </p>
                          {item.selectedColor && (
                            <div className="flex items-center mt-1">
                              <span className="text-xs text-gray-500 ml-2">اللون:</span>
                              <div
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: item.selectedColor }}
                              ></div>
                            </div>
                          )}
                          {item.selectedSize && <p className="text-xs text-gray-500">المقاس: {item.selectedSize}</p>}
                        </div>
                        <Image
                          src={item.selectedImageUrl || "/placeholder.svg"}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="rounded-md"
                        />
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
              <Button variant="ghost" size="icon" onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}>
                <User className="h-5 w-5" />
              </Button>
              {isProfileDropdownOpen && (
                <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700">{user.email}</div>
                    <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      الإعدادات
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button size="sm" className="hidden md:inline-flex">
              <Link href="/auth/login" className="text-foreground hover:text-muted-foreground transition-colors">
                تسجيل الدخول
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn("fixed inset-0 z-50 bg-background md:hidden", isMobileMenuOpen ? "block" : "hidden")}>
        <div className="container h-full px-4 pb-6 pt-20">
          <nav className="flex flex-col space-y-4">
            <Link href="/" className="text-lg font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              الرئيسية
            </Link>
            {/* Add more mobile menu items here */}
          </nav>

          {!user && (
            <div className="mt-6">
              <Button className="w-full">
                <Link href="/auth/login">تسجيل الدخول</Link>
              </Button>
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

