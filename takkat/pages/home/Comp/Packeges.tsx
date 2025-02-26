"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { Star, ShoppingCart, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/firebase"

interface Product {
  id: string
  name: string
  description: string
  price: number
  rating: number
  image: string
  category: string
  inStock: boolean
  stockCount: number
}

export default function BestSellers() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Simplified query that doesn't require a composite index
        const productsQuery = query(collection(db, "products"), orderBy("rating", "desc"), limit(8))

        const querySnapshot = await getDocs(productsQuery)
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[]

        // Filter in-stock products after fetching
        const validProducts = productsData.filter(
          (product) => product.name && product.price && product.inStock === true,
        )

        setProducts(validProducts)
      } catch (err) {
        if (err instanceof Error && err.message.includes("index")) {
          setError("Database configuration needed. Please contact support.")
        } else {
          setError("Failed to load products")
        }
        console.error("Error fetching products:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Rest of the component remains the same
  if (loading) {
    return (
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 animate-pulse">
            <div className="h-6 w-48 bg-muted rounded mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-3">
                  <div className="h-4 w-20 bg-muted rounded mb-2" />
                  <div className="h-4 w-full bg-muted rounded" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-8 px-4 min-h-[40vh] flex items-center justify-center">
        <div className="text-center">
          <Package className="h-8 w-8 text-destructive mx-auto mb-2" />
          <h2 className="text-lg font-semibold text-destructive">{error}</h2>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="mt-2">
            Retry
          </Button>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className="py-8 px-4">
        <div className="text-center">
          <p className="text-muted-foreground">No products available</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold mb-2">Best Sellers</h2>
          <p className="text-sm text-muted-foreground">Top rated products</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="group overflow-hidden hover:shadow-md transition-shadow">
              {/* Product Image */}
              <CardHeader className="p-0">
                <div className="aspect-square relative overflow-hidden bg-muted">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  />
                  {product.stockCount < 5 && (
                    <div className="absolute top-2 right-2">
                      <span className="text-xs bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full">
                        Only {product.stockCount} left
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>

              {/* Product Details */}
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{product.category}</span>
                  <div className="flex items-center">
                    <Star className="w-3 h-3 fill-primary text-primary" />
                    <span className="ml-1 text-xs">{product.rating}</span>
                  </div>
                </div>
                <CardTitle className="text-sm mb-1 line-clamp-1">{product.name}</CardTitle>
                <p className="text-base font-semibold text-primary">${product.price}</p>
              </CardContent>

              {/* Add to Cart Button */}
              <CardFooter className="p-3 pt-0">
                <Button className="w-full h-8 text-xs" variant="secondary" size="sm">
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" size="sm">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  )
}

