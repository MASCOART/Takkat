"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button, Card, CardBody, CardHeader, CardFooter, Divider, Tooltip, Skeleton } from "@nextui-org/react"
import { X, Plus, Minus } from "lucide-react"
import Navbar from "../home/Comp/navbar"

interface CartItem {
  id: string
  name: string
  price: number
  salePrice: number | null
  selectedQuantity: number
  selectedImageUrl: string
  selectedColor: string
  selectedSize: string
}

const ShoppingCart = () => {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchCartItems = async () => {
      // Simulating a delay to show the skeleton loading
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const savedCartItems = localStorage.getItem("cartItems")
      if (savedCartItems) {
        setItems(JSON.parse(savedCartItems))
      }
      setIsLoading(false)
    }

    fetchCartItems()
  }, [])

  const updateQuantity = (id: string, change: number) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, selectedQuantity: Math.max(1, item.selectedQuantity + change) } : item,
    )
    setItems(updatedItems)
    localStorage.setItem("cartItems", JSON.stringify(updatedItems))
  }

  const removeItem = (id: string) => {
    const filteredItems = items.filter((item) => item.id !== id)
    setItems(filteredItems)
    localStorage.setItem("cartItems", JSON.stringify(filteredItems))
  }

  const subtotal = items.reduce((sum, item) => sum + (item.salePrice || item.price) * item.selectedQuantity, 0)
  const itemCount = items.reduce((sum, item) => sum + item.selectedQuantity, 0)

  const handleProceedToPayment = async () => {
    setIsProcessing(true)
    // Simulating a delay for processing
    await new Promise((resolve) => setTimeout(resolve, 2000))
    // Navigate to the payment page
    router.push("/payment")
  }

  const renderSkeletonItem = () => (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <Skeleton className="rounded-md">
          <div className="w-20 h-20"></div>
        </Skeleton>
        <div>
          <Skeleton className="h-4 w-32 mb-2"></Skeleton>
          <Skeleton className="h-3 w-24"></Skeleton>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-24"></Skeleton>
        <Skeleton className="h-6 w-16"></Skeleton>
      </div>
    </div>
  )

  return (
    <div>
      <Navbar/>
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-semibold text-center mb-8">سلة التسوق</h1>

        {isLoading ? (
          <div className="flex flex-col lg:flex-row gap-8">
            <Card className="lg:w-2/3">
              <CardHeader>
                <Skeleton className="h-8 w-48"></Skeleton>
              </CardHeader>
              <Divider />
              <CardBody>
                {[...Array(3)].map((_, index) => (
                  <React.Fragment key={index}>
                    {renderSkeletonItem()}
                    {index < 2 && <Divider />}
                  </React.Fragment>
                ))}
              </CardBody>
            </Card>
            <Card className="lg:w-1/3">
              <CardHeader>
                <Skeleton className="h-8 w-32"></Skeleton>
              </CardHeader>
              <Divider />
              <CardBody>
                <Skeleton className="h-4 w-full mb-2"></Skeleton>
                <Skeleton className="h-4 w-full"></Skeleton>
              </CardBody>
              <Divider />
              <CardFooter>
                <Skeleton className="h-10 w-full"></Skeleton>
              </CardFooter>
            </Card>
          </div>
        ) : items.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardBody className="text-center">
              <p className="text-xl font-semibold mb-2">سلة التسوق فارغة</p>
              <p className="text-gray-500 mb-4">يبدو أنك لم تقم بإضافة أي عناصر إلى سلة التسوق بعد.</p>
              <Link href="/" passHref>
                <Button color="primary">مواصلة التسوق</Button>
              </Link>
            </CardBody>
          </Card>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/3">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">العناصر في السلة</h2>
                </CardHeader>
                <Divider />
                <CardBody>
                  {items.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <div className="flex items-center justify-between py-4">
                        <div className="flex items-center gap-4">
                          <Image
                            src={item.selectedImageUrl || "/placeholder.svg"}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="rounded-md object-cover"
                          />
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Tooltip content={item.selectedColor}>
                                <div
                                  className="w-6 h-6 rounded-full border border-gray-300"
                                  style={{ backgroundColor: item.selectedColor }}
                                />
                              </Tooltip>
                              <span className="text-sm text-gray-500">{item.selectedSize}</span>
                            </div>
                            <Button
                              isIconOnly
                              color="danger"
                              variant="light"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Button isIconOnly variant="flat" size="sm" onClick={() => updateQuantity(item.id, -1)}>
                              <Minus size={16} />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.selectedQuantity}</span>
                            <Button isIconOnly variant="flat" size="sm" onClick={() => updateQuantity(item.id, 1)}>
                              <Plus size={16} />
                            </Button>
                          </div>
                          <div className="text-right">
                            {item.salePrice ? (
                              <>
                                <p className="font-medium text-red-500">
                                  ₪ {(item.salePrice * item.selectedQuantity).toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-500 line-through">
                                  ₪ {(item.price * item.selectedQuantity).toFixed(2)}
                                </p>
                              </>
                            ) : (
                              <p className="font-medium">₪ {(item.price * item.selectedQuantity).toFixed(2)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      {index < items.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </CardBody>
              </Card>
            </div>

            <div className="lg:w-1/3">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">ملخص الطلب</h2>
                </CardHeader>
                <Divider />
                <CardBody>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-700">العناصر</span>
                    <span className="font-medium">{itemCount}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-700">الإجمالي</span>
                    <span className="font-medium">₪ {subtotal.toFixed(2)}</span>
                  </div>
                </CardBody>
                <Divider />
                <CardFooter>
                  <Button color="primary" className="w-full" onClick={handleProceedToPayment} isLoading={isProcessing}>
                    {isProcessing ? "جارٍ المعالجة..." : "المتابعة إلى الدفع"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}

export default ShoppingCart

