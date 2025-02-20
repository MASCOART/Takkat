"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@nextui-org/react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { motion, AnimatePresence } from "framer-motion"

interface HeroSlide {
  id: string
  title: string
  description: string
  imageUrl: string
  linkUrl: string
}

export default function Hero() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const fetchSlides = async () => {
      const slidesCollection = collection(db, "heroSlides")
      const slidesSnapshot = await getDocs(slidesCollection)
      const slidesList = slidesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as HeroSlide[]
      setSlides(slidesList)
    }

    fetchSlides()
  }, [])

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  useEffect(() => {
    if (slides.length > 1) {
      const intervalId = setInterval(nextSlide, 5000)
      return () => clearInterval(intervalId)
    }
  }, [slides.length, nextSlide])

  if (slides.length === 0) {
    return <div className="min-h-[400px] md:min-h-[600px] flex items-center justify-center">Loading...</div>
  }

  const slide = slides[currentSlide]

  return (
    <section className="relative min-h-[400px] md:min-h-[600px] border rtl overflow-hidden" dir="rtl">
      {/* Background Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 z-0"
        >
          <Image src={slide.imageUrl || "/placeholder.svg"} alt={slide.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </motion.div>
      </AnimatePresence>

      {/* Centered Content */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="container px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto"
            >
              <motion.h1
                className="font-serif text-3xl md:text-5xl leading-tight tracking-tight lg:text-6xl text-white mb-4 md:mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {slide.title}
              </motion.h1>
              <motion.p
                className="text-sm md:text-base text-white mb-6 md:mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                {slide.description}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                
                <Link
                  href={slide.linkUrl}
                  className="text-white bg-black inline-block px-6 py-2 md:px-8 md:py-3 text-xl hover:bg-white hover:text-black transition-colors no-underline"
                >
                  تسوق الآن
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Buttons */}
      {slides.length > 1 && (
        <>
          <Button
            isIconOnly
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 rotate-180 z-20 bg-white bg-opacity-50 hover:bg-opacity-75"
            onClick={prevSlide}
          >
            <ChevronLeft />
          </Button>
          <Button
            isIconOnly
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 rotate-180 z-20 bg-white bg-opacity-50 hover:bg-opacity-75"
            onClick={nextSlide}
          >
            <ChevronRight />
          </Button>
        </>
      )}
    </section>
  )
}

