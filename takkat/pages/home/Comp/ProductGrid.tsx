"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

interface ColorImage {
  color: string
  imageUrl: string
}

export interface Product {
  categories: any
  sizes: any
  styles: any
  colors: any
  materials: any
  id: string
  name: string
  colorImages: ColorImage[]
  category: string
  price: number
  salePercentage?: number
  isTopSeller?: boolean
  backgroundColor?: string
  quantity: number
  isVisible: boolean
}

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const router = useRouter()
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    const initialIndexes = products.reduce(
      (acc, product) => {
        acc[product.id] = 0
        return acc
      },
      {} as { [key: string]: number },
    )
    setCurrentImageIndexes(initialIndexes)
  }, [products])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndexes((prevIndexes) => {
        const newIndexes = { ...prevIndexes }
        products.forEach((product) => {
          if (product.colorImages && product.colorImages.length > 1) {
            newIndexes[product.id] = (newIndexes[product.id] + 1) % product.colorImages.length
          }
        })
        return newIndexes
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [products])

  const calculateSalePrice = (price: number, salePercentage: number) => {
    return price * (1 - salePercentage / 100)
  }

  const visibleProducts = products.filter((product) => product.isVisible)

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {visibleProducts.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
          className={`group relative ${product.quantity > 0 ? "cursor-pointer" : "cursor-not-allowed"}`}
          onClick={() => product.quantity > 0 && router.push(`/home/Comp/product/${product.id}`)}
        >
          <div
            className="relative aspect-square mb-4 overflow-hidden"
            style={{ backgroundColor: product.backgroundColor || "#FDF6F6" }}
          >
            {product.quantity === 0 && (
              <motion.div
                className="absolute -top-2 -left-2 z-10"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <svg width="100" height="100" viewBox="6 6 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="7" r="5" fill="red" />
                  <text
                    x="9.6"
                    y="9"
                    fill="white"
                    fontSize="1.1"
                    fontWeight="bold"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    نفذت الكمية
                  </text>
                </svg>
              </motion.div>
            )}

            {product.salePercentage && product.salePercentage > 0 && product.quantity > 0 && (
              <motion.div
                className="absolute -top-2 -left-2 z-10"
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <svg width="100" height="100" viewBox="5 5.5 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="7" r="5" fill="#FF3366" />
                  <text
                    x="9.5"
                    y="9"
                    fill="white"
                    fontSize="1.5"
                    fontWeight="bold"
                    textAnchor="middle"
                    alignmentBaseline="middle"
                  >
                    {product.salePercentage}%خصم
                  </text>
                </svg>
              </motion.div>
            )}
            {product.isTopSeller && product.quantity > 0 && (
              <span className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 text-sm z-10 rounded-full">
                الأكثر مبيعاً
              </span>
            )}
            <Image
              src={product.colorImages[currentImageIndexes[product.id]]?.imageUrl || "/placeholder.svg"}
              alt={product.name}
              fill
              className={`object-cover transition-transform ${product.quantity > 0 ? "group-hover:scale-105" : "opacity-50"}`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          <div className="text-center">
            <h3 className="text-lg font-medium mb-2 font-serif">{product.name}</h3>
            <div className="flex items-center justify-center gap-2">
              {product.quantity > 0 ? (
                product.salePercentage && product.salePercentage > 0 ? (
                  <>
                    <span className="text-gray-400 line-through font-serif">₪{product.price.toFixed(2)}</span>
                    <span className="text-lg font-semibold text-red-500">
                      ₪{calculateSalePrice(product.price, product.salePercentage).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-semibold">₪{product.price.toFixed(2)}</span>
                )
              ) : (
                <span className="text-lg font-semibold text-gray-500">نفذت الكمية</span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

