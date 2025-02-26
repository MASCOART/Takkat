"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardBody, CardHeader, Input, Radio, RadioGroup, Button, Divider } from "@nextui-org/react"
import { User, MapPin, Phone, CreditCard, Tag, AlertCircle, Mail, Plus, Minus, X } from "lucide-react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface CartItem {
  id: string
  name: string
  price: number
  salePrice: number | null
  quantity: number
  selectedColor: string
  selectedSize: string
  selectedImageUrl: string
  selectedQuantity: number
}

export default function PaymentForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deliveryArea, setDeliveryArea] = useState("")
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [discountCode, setDiscountCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false)
  const [discountError, setDiscountError] = useState("")
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    phone: "",
  })

  useEffect(() => {
    const savedCartItems = localStorage.getItem("cartItems")
    if (savedCartItems) {
      setCartItems(JSON.parse(savedCartItems))
    }
    setLoading(false)
  }, [])

  const updateQuantity = (id: string, change: number) => {
    const updatedItems = cartItems.map((item) =>
      item.id === id ? { ...item, selectedQuantity: Math.max(1, item.selectedQuantity + change) } : item,
    )
    setCartItems(updatedItems)
    localStorage.setItem("cartItems", JSON.stringify(updatedItems))
  }

  const removeItem = (id: string) => {
    const updatedItems = cartItems.filter((item) => item.id !== id)
    setCartItems(updatedItems)
    localStorage.setItem("cartItems", JSON.stringify(updatedItems))
  }

  const getDeliveryPrice = () => {
    switch (deliveryArea) {
      case "المنطقة الغربية":
        return 20
      case "48 مناطق":
        return 70
      default:
        return 0
    }
  }

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.salePrice || item.price
    return sum + price * item.selectedQuantity
  }, 0)
  const deliveryFee = getDeliveryPrice()
  const discountAmount = (subtotal * discount) / 100
  const total = subtotal + deliveryFee - discountAmount

  const handleDiscountApply = () => {
    setIsApplyingDiscount(true)
    setDiscountError("")

    setTimeout(() => {
      if (discountCode.toLowerCase() === "welcome") {
        setDiscount(10)
        setDiscountError("")
      } else {
        setDiscount(0)
        setDiscountError("كود الخصم غير صالح")
      }
      setIsApplyingDiscount(false)
    }, 1000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  }
  const handleSubmitOrder = async () => {
    try {
      setSubmitting(true);
  
      // Save order to Firebase
      const orderData = {
        fullName: formData.fullName,
        email: formData.email,
        shippingAddress: formData.address,
        phoneNumber: formData.phone,
        paymentMethod: "Cash on Delivery",
        cartItems: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.salePrice || item.price,
          quantity: item.selectedQuantity,
          color: item.selectedColor,
          size: item.selectedSize,
          image: item.selectedImageUrl, // Include the product image URL
        })),
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        discount: discountAmount,
        total: total,
        createdAt: serverTimestamp(),
        status: "pending",
        expectedArrival: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        trackingNumber: `TK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      };
  
      console.log("Order Data:", orderData); // Debugging: Log the order data
  
      const docRef = await addDoc(collection(db, "orders"), orderData);
      console.log("Order saved with ID:", docRef.id);
  
      // Send confirmation email
      const emailResponse = await fetch("/api/send-order-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order: { ...orderData, id: docRef.id },
          customerEmail: formData.email,
        }),
      });
  
      if (!emailResponse.ok) {
        const errorText = await emailResponse.text();
        console.error("Email sending failed:", errorText);
        throw new Error("Failed to send confirmation email");
      }
  
      const data = await emailResponse.json();
      console.log("Email sent successfully:", data);
  
      // Clear cart and redirect
      localStorage.removeItem("cartItems");
      router.push(`/orders/${docRef.id}`);
    } catch (error) {
      console.error("Error submitting order:", error);
      alert(error instanceof Error ? error.message : "حدث خطأ أثناء تقديم الطلب. يرجى المحاولة مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Information Skeleton */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardBody className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Order Summary Skeleton */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardBody className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-24 w-24" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                ))}
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-12 w-full" />
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">سلة التسوق فارغة</h2>
        <p className="text-gray-600 mb-4">يرجى إضافة منتجات إلى سلة التسوق قبل المتابعة للدفع</p>
        <Button color="primary" href="/cart" as="a">
          العودة إلى سلة التسوق
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <h1 className="text-3xl font-bold text-center mb-8">إتمام الطلب</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">معلومات التوصيل</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="الاسم الكامل"
                placeholder="أدخل اسمك الكامل"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                startContent={<User className="text-default-400 pointer-events-none flex-shrink-0" />}
                isRequired
              />
              <Input
                label="البريد الإلكتروني"
                placeholder="أدخل بريدك الإلكتروني"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                startContent={<Mail className="text-default-400 pointer-events-none flex-shrink-0" />}
                isRequired
              />
              <Input
                label="عنوان التوصيل"
                placeholder="أدخل عنوان التوصيل"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                startContent={<MapPin className="text-default-400 pointer-events-none flex-shrink-0" />}
                isRequired
              />
              <Input
                label="رقم الهاتف"
                placeholder="أدخل رقم هاتفك"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                type="tel"
                startContent={<Phone className="text-default-400 pointer-events-none flex-shrink-0" />}
                isRequired
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">منطقة التوصيل</h2>
            </CardHeader>
            <CardBody>
              <RadioGroup value={deliveryArea} onValueChange={setDeliveryArea}>
                {[
                  { value: "المنطقة الغربية", label: "المنطقة الغربية", price: 20 },
                  { value: "48 مناطق", label: "مناطق الداخل", price: 70 },
                ].map((option) => (
                  <div key={option.value} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-2">
                        <Radio value={option.value} />
                        <span>{option.label}</span>
                      </div>
                      <span className="text-default-500">₪{option.price.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">طريقة الدفع</h2>
            </CardHeader>
            <CardBody className="flex items-center gap-2">
              <CreditCard className="text-default-400" />
              <span>الدفع عند الاستلام</span>
            </CardBody>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">ملخص الطلب</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-4 border-b pb-4">
                  <div className="relative aspect-square w-24 h-24 sm:w-32 sm:h-32">
                    <Image
                      src={item.selectedImageUrl || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <Button isIconOnly variant="light" size="sm" onClick={() => removeItem(item.id)}>
                        <X size={20} />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {item.selectedColor && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">اللون:</span>
                          <div
                            className="w-6 h-6 rounded-full border"
                            style={{ backgroundColor: item.selectedColor }}
                          />
                        </div>
                      )}
                      {item.selectedSize && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">المقاس:</span>
                          <span>{item.selectedSize}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
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
                              ₪{(item.salePrice * item.selectedQuantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500 line-through">
                              ₪{(item.price * item.selectedQuantity).toFixed(2)}
                            </p>
                          </>
                        ) : (
                          <p className="font-medium">₪{(item.price * item.selectedQuantity).toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <Input
                  placeholder="كود الخصم"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  startContent={<Tag className="text-default-400" />}
                />
                <Button
                  color="primary"
                  isLoading={isApplyingDiscount}
                  onClick={handleDiscountApply}
                  className="shrink-0"
                >
                  تطبيق
                </Button>
              </div>

              {discountError && (
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{discountError}</span>
                </div>
              )}

              <Divider />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span>₪{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>رسوم التوصيل:</span>
                  <span>₪{deliveryFee.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>الخصم ({discount}%):</span>
                    <span>-₪{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <Divider />
                <div className="flex justify-between font-bold text-lg">
                  <span>المجموع الكلي:</span>
                  <span>₪{total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                color="primary"
                size="lg"
                className="w-full"
                onClick={handleSubmitOrder}
                isDisabled={!deliveryArea}
                isLoading={submitting}
              >
                تأكيد الطلب
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}