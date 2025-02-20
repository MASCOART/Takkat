"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/router" // Changed from next/navigation to next/router
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Star, ChevronLeft, ChevronRight, Heart } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  price: number
  salePrice: number | null
  colors: Array<{
    name: string
    imageUrl: string
  }>
  sizes: string[]
  quantity: number
  categories: string[]
  sku: string
}

export default function ProductPage() {
  const router = useRouter()
  const { productid } = router.query // Changed from params to router.query
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [cartItems, setCartItems] = useState<
    Array<{ product: Product; color: string; size: string; quantity: number }>
  >([])

  const loadCartItems = useCallback(() => {
    const savedCartItems = localStorage.getItem("cartItems")
    if (savedCartItems) {
      setCartItems(JSON.parse(savedCartItems))
    }
  }, [])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Debug log
        console.log("Fetching product with ID:", productid)

        if (!productid) {
          console.error("No product ID provided")
          router.replace("/404")
          return
        }

        const productRef = doc(db, "products", productid as string)
        const productSnap = await getDoc(productRef)

        // Debug log
        console.log("Product data:", productSnap.data())

        if (productSnap.exists()) {
          const productData = productSnap.data()
          const formattedProduct = {
            id: productSnap.id,
            name: productData.name || "",
            description: productData.description || "",
            price: productData.price || 0,
            salePrice: productData.salePrice || null,
            colors: productData.colors || [],
            sizes: productData.sizes || [],
            quantity: productData.quantity || 0,
            categories: productData.categories || [],
            sku: productData.sku || "",
          } as Product

          // Debug log
          console.log("Formatted product:", formattedProduct)

          setProduct(formattedProduct)
          if (formattedProduct.colors.length > 0) {
            setSelectedColor(formattedProduct.colors[0].name)
          }
          if (formattedProduct.sizes.length > 0) {
            setSelectedSize(formattedProduct.sizes[0])
          }
        } else {
          console.error("Product not found")
          setError("المنتج غير موجود")
        }
      } catch (error) {
        console.error("Error fetching product:", error)
        setError("حدث خطأ أثناء تحميل المنتج")
      } finally {
        setLoading(false)
      }
    }

    if (productid) {
      fetchProduct()
      loadCartItems()
    }
  }, [productid, router, loadCartItems])

  const handleNextImage = () => {
    if (product?.colors.length) {
      setCurrentImageIndex((prev) => (prev + 1) % product.colors.length)
    }
  }

  const handlePrevImage = () => {
    if (product?.colors.length) {
      setCurrentImageIndex((prev) => (prev - 1 + product.colors.length) % product.colors.length)
    }
  }

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      setError("الرجاء اختيار اللون والمقاس")
      return
    }
    if (product) {
      if (isProductInCart()) {
        alert("هذا المنتج موجود بالفعل في سلة التسوق")
        return
      }
      const newItem = {
        product,
        color: selectedColor,
        size: selectedSize,
        quantity: 1,
      }
      const updatedCartItems = [...cartItems, newItem]
      setCartItems(updatedCartItems)
      localStorage.setItem("cartItems", JSON.stringify(updatedCartItems))
      setError(null)
      alert("تمت إضافة المنتج إلى السلة")
    }
  }

  const isProductInCart = useCallback(() => {
    return cartItems.some(
      (item) => item.product.id === product?.id && item.color === selectedColor && item.size === selectedSize,
    )
  }, [cartItems, product, selectedColor, selectedSize])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-red-600">{error}</p>
        <Button onClick={() => router.back()}>العودة</Button>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl">المنتج غير موجود</p>
        <Button onClick={() => router.back()}>العودة</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <nav className="text-sm mb-8">
        <Link href="/" className="text-gray-500 hover:text-gray-900">
          الرئيسية
        </Link>
        <span className="mx-2">/</span>
        {product.categories[0] && (
          <>
            <Link href={`/home/Comp/category/${product.categories[0]}`} className="text-gray-500 hover:text-gray-900">
              المجموعة
            </Link>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
            >
              {product.colors[currentImageIndex]?.imageUrl ? (
                <Image
                  src={product.colors[currentImageIndex].imageUrl || "/placeholder.svg"}
                  alt={`${product.name} - ${product.colors[currentImageIndex].name}`}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-500">لا توجد صورة</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {product.colors.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={handlePrevImage}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={handleNextImage}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {product.colors.length > 0 && (
            <div className="flex gap-4 mt-4 overflow-x-auto pb-2">
              {product.colors.map((color, index) => (
                <button
                  key={color.name}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${
                    index === currentImageIndex ? "ring-2 ring-primary" : "ring-1 ring-gray-200"
                  }`}
                >
                  {color.imageUrl ? (
                    <Image src={color.imageUrl || "/placeholder.svg"} alt={color.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="w-8 h-8 rounded-full" style={{ backgroundColor: color.name }} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`h-5 w-5 ${star <= 4 ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
            ))}
            <span className="text-sm text-gray-600">(42 تقييم)</span>
          </div>

          <div className="mb-6">
            {product.salePrice ? (
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-red-600">₪{product.salePrice}</span>
                <span className="text-xl text-gray-500 line-through">₪{product.price}</span>
                <span className="text-sm text-red-600">
                  (خصم {Math.round(((product.price - product.salePrice) / product.price) * 100)}%)
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold">₪{product.price}</span>
            )}
          </div>

          {error && <div className="mb-4 p-2 bg-red-50 text-red-600 rounded">{error}</div>}

          {product.colors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">اللون</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-12 h-12 rounded-full border-2 ${
                      selectedColor === color.name ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <div className="w-full h-full rounded-full" style={{ backgroundColor: color.name.toLowerCase() }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">المقاس</h3>
              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 border rounded ${
                      selectedSize === size
                        ? "border-primary bg-primary text-white"
                        : "border-gray-200 hover:border-primary"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={product.quantity === 0}>
              {product.quantity === 0 ? "نفذت الكمية" : "أضف إلى السلة"}
            </Button>
            <Button size="lg" variant="outline">
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          {product.quantity <= 5 && product.quantity > 0 && (
            <p className="text-red-600 text-sm mt-2">باقي {product.quantity} قطع فقط في المخزون!</p>
          )}

          <div className="mt-8">
            <h3 className="font-medium mb-2">الوصف</h3>
            <p className="text-gray-600">{product.description}</p>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <p>SKU: {product.sku}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

