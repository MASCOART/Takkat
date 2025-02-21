"use client"

import { useState, useEffect } from "react"
import { Button, Checkbox, Input, Slider } from "@nextui-org/react"
import { Plus } from 'lucide-react'
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface FilterSidebarProps {
  filters: {
    minPrice: string
    maxPrice: string
    searchTerm: string
    categories: string[]
    sizes: string[]
    styles: string[]
    colors: string[]
    materials: string[]
  }
  onFilterChange: (newFilters: Partial<FilterSidebarProps["filters"]>) => void
  products: any[]
}

export default function FilterSidebar({ filters, onFilterChange, products }: FilterSidebarProps) {
  const [categories, setCategories] = useState<{ id: string; name: string; count: number }[]>([])
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]) // Default range

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesCollection = collection(db, "categories")
      const categoriesSnapshot = await getDocs(categoriesCollection)
      const categoriesList = categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        count: products.filter((product) => product.categories.includes(doc.id)).length,
      }))
      setCategories(categoriesList)
    }

    fetchCategories()
  }, [products])

  useEffect(() => {
    // Sync priceRange with filters
    setPriceRange([Number(filters.minPrice) || 0, Number(filters.maxPrice) || 1000])
  }, [filters.minPrice, filters.maxPrice])

  const handleCheckboxChange = (filterType: keyof FilterSidebarProps["filters"], value: string) => {
    const currentFilters = filters[filterType] as string[]
    const updatedFilters = currentFilters.includes(value)
      ? currentFilters.filter((item) => item !== value)
      : [...currentFilters, value]
    onFilterChange({ [filterType]: updatedFilters })
  }

  const handlePriceRangeChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      setPriceRange(value as [number, number])
      onFilterChange({ minPrice: String(value[0]), maxPrice: String(value[1]) })
    }
  }

  const sizes = Array.from(new Set(products.flatMap((product) => product.sizes || [])))
  const styles = Array.from(new Set(products.flatMap((product) => product.styles || [])))
  const colors = Array.from(new Set(products.flatMap((product) => product.colors.map((c: any) => c.name))))
  const materials = Array.from(new Set(products.flatMap((product) => product.materials || [])))

  const displayedCategories = showAllCategories ? categories : categories.slice(0, 5)

  return (
    <aside className="w-full space-y-6">
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-4">تصفية</h3>

        {/* Category Section */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">الفئة</h4>
          <div className="space-y-2">
            {displayedCategories.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <Checkbox
                  size="sm"
                  isSelected={filters.categories.includes(item.id)}
                  onValueChange={() => handleCheckboxChange("categories", item.id)}
                >
                  {item.name}
                </Checkbox>
                <span className="text-sm text-gray-500">({item.count})</span>
              </div>
            ))}
            {categories.length > 5 && (
              <Button
                variant="light"
                size="sm"
                className="text-sm"
                endContent={<Plus size={16} />}
                onClick={() => setShowAllCategories(!showAllCategories)}
              >
                {showAllCategories ? "عرض أقل" : "عرض المزيد"}
              </Button>
            )}
          </div>
        </div>

        {/* Size Section */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">الحجم</h4>
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => (
              <Button
                key={size}
                variant={filters.sizes.includes(size) ? "solid" : "bordered"}
                size="sm"
                className="text-sm"
                onClick={() => handleCheckboxChange("sizes", size)}
              >
                {size}
              </Button>
            ))}
          </div>
        </div>

        {/* Style Section */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">النمط</h4>
          <div className="space-y-2">
            {styles.map((style) => (
              <div key={style} className="flex items-center">
                <Checkbox
                  size="sm"
                  isSelected={filters.styles.includes(style)}
                  onValueChange={() => handleCheckboxChange("styles", style)}
                >
                  {style}
                </Checkbox>
              </div>
            ))}
          </div>
        </div>

        {/* Color Section */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">اللون</h4>
          <div className="grid grid-cols-6 gap-2">
            {colors.map((color) => (
              <div
                key={color}
                className={`w-6 h-6 rounded-full border cursor-pointer ${
                  filters.colors.includes(color) ? "ring-2 ring-offset-2 ring-primary" : ""
                }`}
                style={{
                  backgroundColor: color.toLowerCase(),
                  borderColor: color.toLowerCase() === "white" ? "#e5e5e5" : color.toLowerCase(),
                }}
                title={color}
                onClick={() => handleCheckboxChange("colors", color)}
              />
            ))}
          </div>
        </div>

   

        {/* Price Range Section */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">نطاق السعر</h4>
          <div className="space-y-4 ">
            <Slider
              label="السعر"
              step={10}
              minValue={0}
              maxValue={1000}
              value={priceRange}
              onChange={handlePriceRangeChange}
              formatOptions={{ style: "currency", currency: "NIS" }}
              className="max-w-md "
            />
            <div className="flex gap-2">
              <Input
                type="number"
                label="الحد الأدنى"
                value={filters.minPrice}
                onChange={(e) => onFilterChange({ minPrice: e.target.value })}
                className="w-1/2"
              />
              <Input
                type="number"
                label="الحد الأقصى"
                value={filters.maxPrice}
                onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
                className="w-1/2"
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}