"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardBody, CardHeader, Divider, Progress, Spacer } from "@nextui-org/react"
import { Package, Send, Truck, Home, Check } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  color?: string
  size?: string
}

interface Order {
  id: string
  fullName: string
  email: string
  shippingAddress: string
  phoneNumber: string
  paymentMethod: string
  cartItems: OrderItem[]
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  createdAt: any
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  expectedArrival: string
  trackingNumber: string
}

async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const orderDoc = await getDoc(doc(db, "orders", orderId))

    if (orderDoc.exists()) {
      return { id: orderDoc.id, ...orderDoc.data() } as Order
    }
    return null
  } catch (error) {
    console.error("Error fetching order:", error)
    return null
  }
}

function calculateDeliveryDate(orderDate: Date): string {
  const deliveryDate = new Date(orderDate)
  deliveryDate.setDate(deliveryDate.getDate() + 3)
  return deliveryDate.toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })
}

export default function OrderPage() {
  const params = useParams() // Get the dynamic route parameters
  const orderId = params?.orderId as string // Use optional chaining to avoid errors

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        const orderData = await getOrder(orderId)
        setOrder(orderData)
        setLoading(false)
      }

      fetchOrder()
    } else {
      setLoading(false)
    }
  }, [orderId])

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <Card>
          <CardBody>
            <p className="text-center">رقم الطلب مفقود</p>
          </CardBody>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <Card>
          <CardBody>
            <p className="text-center">جاري التحميل...</p>
          </CardBody>
        </Card>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <Card>
          <CardBody>
            <p className="text-center">لم يتم العثور على الطلب</p>
          </CardBody>
        </Card>
      </div>
    )
  }

  // Note: For RTL, we're keeping the steps in the same visual order
  // but the progress will flow right-to-left naturally
  const steps = [
    {
      title: "تم تقديم الطلب",
      subtitle: "استلمنا طلبك",
      icon: Package,
      completed: order.status !== "pending",
    },
    {
      title: "قيد المعالجة",
      subtitle: "نقوم بتجهيز طلبك",
      icon: Send,
      completed: ["processing", "shipped", "delivered"].includes(order.status),
    },
    {
      title: "تم الشحن",
      subtitle: "طلبك في الطريق إليك",
      icon: Truck,
      completed: ["shipped", "delivered"].includes(order.status),
    },
    {
      title: "تم التوصيل",
      subtitle: "استمتع بمشترياتك!",
      icon: Home,
      completed: order.status === "delivered",
    },
  ]

  const progressPercentage =
    order.status === "pending"
      ? 25
      : order.status === "processing"
        ? 50
        : order.status === "shipped"
          ? 75
          : order.status === "delivered"
            ? 100
            : 0

  return (
    <div className="min-h-screen py-8 px-4 md:px-0 bg-gradient-to-b from-blue-50 to-white" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-800">تفاصيل ومتابعة الطلب</h1>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 max-w-6xl mx-auto">
        <motion.div
          className="md:col-span-1"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="w-full shadow-lg">
            <CardHeader className="bg-blue-100 text-blue-800">
              <h3 className="text-2xl font-semibold">معلومات الطلب</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid gap-4">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-600">رقم الطلب:</span>
                  <span>{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-600">الاسم:</span>
                  <span>{order.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-600">البريد الإلكتروني:</span>
                  <span>{order.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-600">رقم الهاتف:</span>
                  <span>{order.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-600">عنوان التوصيل:</span>
                  <span>{order.shippingAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-600">طريقة الدفع:</span>
                  <span>{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-600">تاريخ الطلب:</span>
                  <span>
                    {new Date(order.createdAt.toDate()).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          className="md:col-span-1"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="w-full shadow-lg">
            <CardHeader className="bg-blue-100 text-blue-800">
              <h3 className="text-2xl font-semibold">المنتجات المطلوبة</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {order.cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 pb-4 border-b last:border-0"
                  >
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <span className="font-semibold block text-right">{item.name}</span>
                      <span className="text-sm text-gray-500 block text-right">
                        الكمية: {item.quantity}
                        {item.color && ` | اللون: ${item.color}`}
                        {item.size && ` | المقاس: ${item.size}`}
                      </span>
                    </div>
                    <span className="font-semibold text-blue-800">₪{(item.price * item.quantity).toFixed(2)}</span>
                  </motion.div>
                ))}
              </div>

              <Divider className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span>₪{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>رسوم التوصيل:</span>
                  <span>₪{order.deliveryFee.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>الخصم:</span>
                    <span>-₪{order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg text-blue-800">
                  <span>المجموع الكلي:</span>
                  <span>₪{order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          className="col-span-full"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card className="w-full shadow-lg">
            <CardHeader className="bg-blue-100 text-blue-800">
              <h3 className="text-2xl font-semibold">متابعة الطلب</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-600">حالة الطلب:</span>
                  <span className="text-blue-800 font-semibold">
                    {order.status === "pending"
                      ? "قيد الانتظار"
                      : order.status === "processing"
                        ? "قيد المعالجة"
                        : order.status === "shipped"
                          ? "تم الشحن"
                          : order.status === "delivered"
                            ? "تم التوصيل"
                            : "ملغي"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-600">موعد التوصيل المتوقع:</span>
                  <span className="text-blue-800 font-semibold">{calculateDeliveryDate(order.createdAt.toDate())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-gray-600">رقم التتبع:</span>
                  <span className="text-blue-800 font-semibold">{order.trackingNumber}</span>
                </div>
              </div>

              <Spacer y={4} />

              <div className="transform scale-x-[-1]">
                <Progress value={progressPercentage} color="primary" className="h-2 mb-8" aria-label="Order Progress" />
              </div>

              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                {steps.map((step, index) => (
                  <div key={index} className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.2 }}
                      className="flex flex-col items-center"
                    >
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                          step.completed ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {step.completed ? <Check className="w-8 h-8" /> : <step.icon className="w-8 h-8" />}
                      </div>
                      <span className="font-semibold text-blue-800">{step.title}</span>
                      <span className="text-sm text-gray-500">{step.subtitle}</span>
                    </motion.div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

