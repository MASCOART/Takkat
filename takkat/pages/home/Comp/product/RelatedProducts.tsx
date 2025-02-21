"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import { collection, getDocs, query, where, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Skeleton } from "@/components/ui/skeleton"

// Import Swiper styles
import "swiper/css"
import "swiper/css/pagination"

interface Product {
  id: string
  name: string
  price: number
  salePrice: number | null
  colors: { name: string; imageUrl: string }[]
  quantity: number
  categories: string[]
}

interface RelatedProductsProps {
  currentProductId: string
  category: string
}

export default function RelatedProducts({ currentProductId, category }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: string]: number }>({})
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        console.log("Fetching related products for category:", category)
        const q = query(
          collection(db, "products"),
          where("categories", "array-contains", category),
          where("isVisible", "==", true),
          limit(8),
        )
        const querySnapshot = await getDocs(q)
        const productsList = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((product) => product.id !== currentProductId) as Product[]
        console.log("Fetched products:", productsList)
        setProducts(productsList)

        const initialIndexes = productsList.reduce(
          (acc, product) => {
            acc[product.id] = 0
            return acc
          },
          {} as { [key: string]: number },
        )
        setCurrentImageIndexes(initialIndexes)
      } catch (error) {
        console.error("Error fetching related products:", error)
      } finally {
        setLoading(false)
      }
    }

    if (category) {
      fetchRelatedProducts()
    }
  }, [category, currentProductId])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndexes((prevIndexes) => {
        const newIndexes = { ...prevIndexes }
        products.forEach((product) => {
          if (product.colors && product.colors.length > 1) {
            newIndexes[product.id] = (newIndexes[product.id] + 1) % product.colors.length
          }
        })
        return newIndexes
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [products])

  const handleProductClick = (productId: string) => {
    router.push(`/home/Comp/product/${productId}`)
  }

  if (loading) {
    return (
      <section className="py-12" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-3/4 mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    console.log("No related products found")
    return null
  }

  console.log("Rendering related products:", products)

  return (
    <section className="py-12" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-semibold text-gray-900 mb-2">منتجات ذات صلة</h3>
        </div>

        <Swiper
          slidesPerView={2}
          spaceBetween={16}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 3,
            },
            1024: {
              slidesPerView: 4,
            },
          }}
          pagination={{
            clickable: true,
            el: ".swiper-pagination",
          }}
          modules={[Pagination]}
          className="mySwiper"
        >
          {products.map((product, index) => (
            <SwiperSlide key={product.id}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => handleProductClick(product.id)}
              >
                <div className="relative aspect-square mb-4 overflow-hidden bg-gray-100 rounded-lg">
                  {product.quantity === 0 && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded-full z-10">
                      نفذت الكمية
                    </div>
                  )}
                  {product.salePrice && product.salePrice < product.price && product.quantity > 0 && (
                    <motion.div
                      className="absolute -top-2 -left-2 z-10"
                      whileHover={{ y: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <svg width="100" height="100" viewBox="5 5 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="8" cy="7" r="5" fill="#FF3366" />
                        <text
                          x="9.4"
                          y="9"
                          fill="white"
                          fontSize="1.5"
                          fontWeight="bold"
                          textAnchor="middle"
                          alignmentBaseline="middle"
                        >
                          {Math.round(((product.price - product.salePrice) / product.price) * 100)}%خصم
                        </text>
                      </svg>
                    </motion.div>
                  )}
                  <Image
                    src={product.colors[currentImageIndexes[product.id]]?.imageUrl || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">{product.name}</h3>
                  <div className="flex items-center justify-center gap-2">
                    {product.salePrice && product.salePrice < product.price ? (
                      <>
                        <span className="text-gray-400 line-through">₪{product.price.toFixed(2)}</span>
                        <span className="text-lg font-semibold text-red-500">₪{product.salePrice.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="text-lg font-semibold">₪{product.price.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}

          <div className="swiper-pagination !relative !mt-8"></div>
        </Swiper>
      </div>
    </section>
  )
}

