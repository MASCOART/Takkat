"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Link from "next/link"
import { motion } from "framer-motion"
import { ProductGrid, type Product } from "./ProductGrid"
import FilterSidebar from "./FilterSidebar"
import Image from "next/image"
import Navbar from "./navbar"

interface Category {
  id: string
  name: string
  imageUrl?: string
}

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    searchTerm: "",
    categories: [] as string[],
    sizes: [] as string[],
    styles: [] as string[],
    colors: [] as string[],
    materials: [] as string[],
  })

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        if (!params || !params.categoryId) {
          router.replace("/404")
          return
        }

        const categoryRef = doc(db, "categories", params.categoryId as string)
        const categorySnap = await getDoc(categoryRef)

        if (categorySnap.exists()) {
          const categoryData = categorySnap.data() as Category
          setCategory({ ...categoryData, id: categorySnap.id })

          const productsRef = collection(db, "products")
          const q = query(productsRef, where("categories", "array-contains", categorySnap.id))
          const productsSnap = await getDocs(q)
          const productData = productsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            colorImages: doc.data().colors.map((color: any) => ({
              color: color.name,
              imageUrl: color.imageUrl,
            })),
            salePercentage: doc.data().salePrice
              ? ((doc.data().price - doc.data().salePrice) / doc.data().price) * 100
              : 0,
          })) as Product[]
          setProducts(productData)
          setFilteredProducts(productData)
        } else {
          router.replace("/404")
        }
      } catch (error) {
        console.error("Error fetching category:", error)
        router.replace("/500")
      } finally {
        setLoading(false)
      }
    }

    if (params?.categoryId) {
      fetchCategoryAndProducts()
    }
  }, [params, router])

  useEffect(() => {
    const filtered = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
      const matchesMinPrice = !filters.minPrice || product.price >= Number(filters.minPrice)
      const matchesMaxPrice = !filters.maxPrice || product.price <= Number(filters.maxPrice)
      const matchesCategories =
        filters.categories.length === 0 || filters.categories.some((cat) => product.categories.includes(cat))
      const matchesSizes = filters.sizes.length === 0 || filters.sizes.some((size) => product.sizes?.includes(size))
      const matchesStyles = filters.styles.length === 0 || filters.styles.some((style) => product.styles?.includes(style))
      const matchesColors =
        filters.colors.length === 0 || filters.colors.some((color) => product.colors.some((c: { name: string }) => c.name === color))
      const matchesMaterials =
        filters.materials.length === 0 || filters.materials.some((material) => product.materials?.includes(material))

      return (
        matchesSearch &&
        matchesMinPrice &&
        matchesMaxPrice &&
        matchesCategories &&
        matchesSizes &&
        matchesStyles &&
        matchesColors &&
        matchesMaterials
      )
    })
    setFilteredProducts(filtered)
  }, [products, filters])

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-900">الفئة غير موجودة</p>
      </div>
    )
  }

  return (
    <div>
<Navbar/>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
    
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="flex flex-col lg:flex-row gap-8 mb-8">
          <div className="lg:w-1/4">
            {category.imageUrl && (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <Image
                  src={category.imageUrl || "/placeholder.svg"}
                  alt={`صورة فئة ${category.name}`}
                  width={400}
                  height={400}
                  className="w-full h-auto object-cover rounded-lg shadow-lg"
                />
              </motion.div>
            )}
            <FilterSidebar filters={filters} onFilterChange={handleFilterChange} products={products} />
          </div>

          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">المنتجات</h2>
              <p className="text-gray-600">
                عرض {filteredProducts.length} من أصل {products.length} منتج
              </p>
            </div>
            <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
            <p className="text-gray-600 mb-6">
              اكتشف أحدث مجموعة من {category.name}. منتجات عالية الجودة مصممة لتعزيز أناقتك وراحتك.
            </p>
            <nav className="text-sm mb-4">
              <Link href="/Home" className="text-gray-500 hover:text-gray-900">
                الرئيسية
              </Link>
              <span className="mx-2">/</span>
              <span className="text-primary">{category.name}</span>
            </nav>
            <ProductGrid products={filteredProducts} />
          </div>
        </div>
      </div>
    </motion.div>
    </div>

  )
}
