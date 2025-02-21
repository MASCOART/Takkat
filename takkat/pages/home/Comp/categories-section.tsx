"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@nextui-org/react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@nextui-org/react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import { motion, AnimatePresence } from "framer-motion"

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
  const { isOpen, onOpen, onClose } = useDisclosure()

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
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-6 w-20" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  const CategoryCard = ({
    category,
    index,
    isModal = false,
  }: {
    category: Category
    index: number
    isModal?: boolean
  }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="h-full"
      >
        <Link href={`/category/${category.id}`} className="block h-full">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
            <Image
              src={category.imageUrl || "/placeholder.svg"}
              alt={category.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 25vw"
              priority={index < 4}
            />

            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />

            <div className="absolute inset-0 p-3 flex flex-col justify-between">
              <div className="self-start">
                <span className="inline-flex items-center rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-gray-900">
                  {category.productCount} منتج
                </span>
              </div>
              <h3 className="text-sm font-medium text-white">{category.name}</h3>
            </div>
          </div>
        </Link>
      </motion.div>
    )
  }

  return (
    <section className="py-8 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="flex flex-col items-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">اختر الفئات</h2>
          <Button color="primary" variant="light" className="text-sm text-black" onClick={onOpen}>
            عرض الكل
          </Button>
        </motion.div>

        {/* Mobile and Desktop Swiper */}
        <div className="relative">
          <Swiper
            slidesPerView={2.5}
            spaceBetween={12}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            breakpoints={{
              640: {
                slidesPerView: 4.5,
                spaceBetween: 16,
              },
              1024: {
                slidesPerView: 6.5,
                spaceBetween: 20,
              },
            }}
            modules={[Pagination]}
            className="mySwiper !pb-12"
          >
            {categories.map((category, index) => (
              <SwiperSlide key={category.id}>
                <CategoryCard category={category} index={index} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside" dir="rtl">
            <ModalContent>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <ModalHeader className="text-center">جميع الفئات</ModalHeader>
                <ModalBody>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
                    {categories.map((category, index) => (
                      <CategoryCard key={category.id} category={category} index={index} isModal={true} />
                    ))}
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    إغلاق
                  </Button>
                </ModalFooter>
              </motion.div>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: #000;
          background: white;
          border-radius: 50%;
          width: 35px;
          height: 35px;
        }

        .swiper-button-next:after,
        .swiper-button-prev:after {
          font-size: 1.2rem;
        }

        .swiper-button-disabled {
          opacity: 0.35;
          pointer-events: none;
        }
      `}</style>
    </section>
  )
}

