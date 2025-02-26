"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"

// Import Swiper styles
import "swiper/css"
import "swiper/css/pagination"

interface Category {
  id: string
  name: string
  imageUrl: string
  productCount?: number
}

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const fetchCategoriesAndCounts = async () => {
      try {
        const categoriesCollection = collection(db, "categories")
        const categoriesSnapshot = await getDocs(categoriesCollection)
        const categoriesList = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          productCount: 0,
        })) as Category[]

        const productsCollection = collection(db, "products")
        const productCountPromises = categoriesList.map(async (category) => {
          const q = query(
            productsCollection,
            where("categories", "array-contains", category.id),
            where("isVisible", "==", true),
          )
          const querySnapshot = await getDocs(q)
          return querySnapshot.size
        })

        const productCounts = await Promise.all(productCountPromises)
        const categoriesWithCounts = categoriesList.map((category, index) => ({
          ...category,
          productCount: productCounts[index],
        }))

        setCategories(categoriesWithCounts)
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoriesAndCounts()
  }, [])

  if (loading) {
    return (
      <section className="py-12 px-4" dir="rtl">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center mb-8">
            <Skeleton className="h-8 w-40" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <Skeleton className="h-32 w-32 sm:h-40 sm:w-40 rounded-full" />
                <Skeleton className="h-4 w-24 sm:w-32 mt-4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const CategoryCard = ({
    category,
    index,
  }: {
    category: Category
    index: number
  }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="flex flex-col items-center"
      >
        <Link href={`/home/Comp/${category.id}`} className="block no-underline">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gray-100 overflow-hidden mb-4">
            <Image
              src={category.imageUrl || "/placeholder.svg"}
              alt={category.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 128px, 160px"
              priority={index < 5}
            />
          </div>
          <h3 className="text-center text-sm font-medium text-gray-900 mt-2 max-w-[128px] sm:max-w-[160px]">
            {category.name}
          </h3>
        
        </Link>
      </motion.div>
    )
  }

  return (
    <section className="py-4 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="flex justify-center items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900">عرض الفئات</h2>
        </motion.div>

        {/* Desktop View */}
        <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.slice(0, 5).map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>

        {/* Mobile Swiper */}
        <div className="sm:hidden relative">
          <Swiper
            slidesPerView={2.2}
            spaceBetween={16}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            modules={[Pagination]}
            className="!pb-12"
          >
            {categories.map((category, index) => (
              <SwiperSlide key={category.id}>
                <CategoryCard category={category} index={index} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="flex justify-center mt-8">
          <Button variant="ghost" className="text-sm no-underline" onClick={() => setIsOpen(true)}>
            عرض الكل
          </Button>
        </div>
      </div>

      <AnimatePresence>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-5xl" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="text-center">جميع الفئات</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
                {categories.map((category, index) => (
                  <CategoryCard key={category.id} category={category} index={index} />
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  إغلاق
                </Button>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        </Dialog>
      </AnimatePresence>

      <style jsx global>{`
        .swiper-pagination-bullet {
          background: #000;
          opacity: 0.5;
        }
        
        .swiper-pagination-bullet-active {
          opacity: 1;
        }

        a {
          text-decoration: none;
        }
      `}</style>
    </section>
  )
}

