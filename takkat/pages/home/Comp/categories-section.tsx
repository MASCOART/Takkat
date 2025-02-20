"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@nextui-org/react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Category {
  id: string
  name: string
  imageUrl: string
}

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesCollection = collection(db, "categories")
        const categoriesSnapshot = await getDocs(categoriesCollection)
        const categoriesList = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[]
        setCategories(categoriesList)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }

    fetchCategories()
  }, [])

  // Auto-slide functionality
  useEffect(() => {
    if (categories.length <= 5) return // No auto-slide if there are 5 or fewer categories

    const autoSlide = setInterval(() => {
      nextSlide()
    }, 5000)

    return () => clearInterval(autoSlide)
  }, [categories.length]) // Add categories.length as a dependency

  // Go to the next slide
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 5 >= categories.length ? 0 : prevIndex + 5))
  }

  // Go to the previous slide
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 5 < 0 ? Math.max(categories.length - 5, 0) : prevIndex - 5))
  }

  return (
    <section className="py-12 px-4 rtl" dir="rtl">
      <h2 className="text-3xl font-bold text-center mb-8">الفئات</h2>
      <div className="relative max-w-6xl mx-auto">
        <div ref={containerRef} className="overflow-hidden">
          <motion.div
            className="flex transition-transform duration-300 ease-in-out"
            animate={{ x: `${-currentIndex * 20}%` }}
          >
            {categories.map((category) => (
              <div key={category.id} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 flex-shrink-0 px-2">
                <Link href={`/home/Comp/${category.id}`} className="block text-center group">
                  <div className="relative w-32 h-32 mx-auto mb-2 rounded-full overflow-hidden transition-transform transform group-hover:scale-105">
                    <Image
                      src={category.imageUrl || "/placeholder.svg"}
                      alt={category.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={currentIndex <= 5} // Prioritize loading the first few images
                    />
                  </div>
                  <Button className="bg-white text-lg w-full">{category.name}</Button>
                </Link>
              </div>
            ))}
          </motion.div>
        </div>
        {categories.length > 5 && (
          <>
            <Button
              isIconOnly
              className="absolute right-0 top-1/2 -translate-y-1/2 rotate-180 z-10"
              onClick={prevSlide}
              aria-label="Previous slide"
            >
              <ChevronLeft />
            </Button>
            <Button
              isIconOnly
              className="absolute left-0 top-1/2 -translate-y-1/2 rotate-180 z-10"
              onClick={nextSlide}
              aria-label="Next slide"
            >
              <ChevronRight />
            </Button>
          </>
        )}
      </div>
    </section>
  )
}