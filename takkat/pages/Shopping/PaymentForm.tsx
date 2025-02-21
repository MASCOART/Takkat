"use client"

import { useState } from "react"
import {
  NextUIProvider,
  Card,
  CardBody,
  CardHeader,
  Input,
  Radio,
  RadioGroup,
  Button,
  Divider,
} from "@nextui-org/react"
import { User, MapPin, Phone, CreditCard, ShoppingBag } from "lucide-react"

export default function PaymentForm() {
  const [deliveryArea, setDeliveryArea] = useState("")
  const [products] = useState([
    { name: "منتج 1", price: 50 },
    { name: "منتج 2", price: 30 },
  ])

  const getDeliveryPrice = () => {
    switch (deliveryArea) {
      case "الضفة الغربية":
        return 20
      case "القدس":
        return 30
      case "مناطق 48":
        return 70
      default:
        return 0
    }
  }

  const totalPrice = products.reduce((sum, product) => sum + product.price, 0) + getDeliveryPrice()

  return (
    <NextUIProvider>
      <div
        className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 p-4"
        dir="rtl"
      >
        <Card className="w-full max-w-3xl">
          <CardHeader className="flex justify-center bg-gradient-to-r from-blue-600 to-purple-600">
            <h1 className="text-2xl font-bold text-white">نموذج الدفع والتوصيل</h1>
          </CardHeader>
          <CardBody className="gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="الاسم الكامل"
                
                placeholder="أدخل اسمك الكامل"
                startContent={<User className="text-default-400 pointer-events-none flex-shrink-0   pt-1" />}
              />
              <Input
                label="عنوان التوصيل"
                placeholder="أدخل عنوان التوصيل"
                startContent={<MapPin className="text-default-400 pointer-events-none flex-shrink-0
                  pt-1"
                   />}

              />
              <Input
                label="رقم الهاتف"
                placeholder="أدخل رقم هاتفك"
                type="tel"
                startContent={<Phone className="text-default-400 pointer-events-none flex-shrink-0   pt-1" />}
              />
            </div>

            <Divider />
            <div className="space-y-4" dir="rtl">
  <h3 className="text-lg font-semibold mb-4" dir="rtl">آلية التوصيل</h3>
  <RadioGroup value={deliveryArea} onValueChange={setDeliveryArea} dir="rtl">
    {[
      { value: "المنطقة الغربية", label: "المنطقة الغربية", price: 20 },
      
      { value: "48 مناطق", label: " مناطق الداخل", price: 70 },
    ].map((option) => (
      <div key={option.value} className="border rounded-lg p-4 hover:bg-gray-50">
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
</div>
            <Divider />

            <div className="space-y-2">
              <h3 className="flex items-center text-lg font-semibold">
                <CreditCard className="ml-2" />
                طريقة الدفع
              </h3>
              <p>الدفع عند الاستلام</p>
            </div>

            <Divider />

            <div className="space-y-4">
              <h3 className="flex items-center text-lg font-semibold">
                <ShoppingBag className="ml-2" />
                ملخص الطلب
              </h3>
              {products.map((product, index) => (
                <div key={index} className="flex justify-between">
                  <span>{product.name}</span>
                  <span>{product.price} ₪</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span>رسوم التوصيل</span>
                <span>{getDeliveryPrice()} ₪</span>
              </div>
              <Divider />
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">المجموع الكلي:</h3>
                <span className="text-lg font-bold">{totalPrice} ₪</span>
              </div>
            </div>

            <Button color="primary" size="lg" className="w-full">
              تأكيد الطلب
            </Button>
          </CardBody>
        </Card>
      </div>
    </NextUIProvider>
  )
}

