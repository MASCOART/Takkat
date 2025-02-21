"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import Link from "next/link";

interface CartItem {
  id: string;
  name: string;
  price: number;
  salePrice?: number;
  quantity: number;
  image: string;
  color?: string;
  size?: string;
}

export default function ShoppingCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const router = useRouter();

  // Fetch cart items from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      const cartItems = JSON.parse(storedCart);
      setItems(cartItems);
    }
  }, []);

  // Update quantity of an item
  const updateQuantity = (id: string, change: number) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + change) } : item,
    );
    setItems(updatedItems);
    localStorage.setItem("cart", JSON.stringify(updatedItems));
  };

  // Remove an item from the cart
  const removeItem = (id: string) => {
    const filteredItems = items.filter((item) => item.id !== id);
    setItems(filteredItems);
    localStorage.setItem("cart", JSON.stringify(filteredItems));
  };

  // Calculate subtotal and total items
  const subtotal = items.reduce((sum, item) => sum + (item.salePrice || item.price) * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // If the cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Image src="/placeholder.svg" alt="Empty Cart" width={200} height={200} className="mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">سلة التسوق فارغة</h2>
          <p className="text-gray-600 mb-6">يبدو أنك لم تقم بإضافة أي عناصر إلى سلة التسوق بعد.</p>
          <Button onClick={() => router.push("/products")} className="bg-primary text-white hover:bg-primary/90">
            مواصلة التسوق
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 pt-24">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-8 text-center text-gray-800"
        >
          سلة التسوق
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <Card className="lg:col-span-2">
            <CardContent className="p-6">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center gap-4 py-4">
                    {/* Product Image */}
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="rounded-md object-cover"
                    />

                    {/* Product Details */}
                    <div className="flex-grow space-y-1">
                      <p className="font-medium text-gray-800">{item.name}</p>

                      {/* Color and Size */}
                      {(item.color || item.size) && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          {item.color && (
                            <div className="flex items-center gap-1">
                              <div
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: item.color }}
                              ></div>
                              <span>{item.color}</span>
                            </div>
                          )}
                          {item.size && <span>المقاس: {item.size}</span>}
                        </div>
                      )}

                      {/* Quantity and Price */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="h-8 w-8"
                          >
                            -
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="h-8 w-8"
                          >
                            +
                          </Button>
                        </div>
                        <div className="text-right">
                          {item.salePrice ? (
                            <>
                              <p className="font-medium text-red-500">
                                ₪ {(item.salePrice * item.quantity).toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-500 line-through">
                                ₪ {(item.price * item.quantity).toFixed(2)}
                              </p>
                            </>
                          ) : (
                            <p className="font-medium">₪ {(item.price * item.quantity).toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {index < items.length - 1 && <Separator className="my-4" />}
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">ملخص الطلب</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">العناصر ({itemCount})</span>
                  <span className="font-medium">₪ {subtotal.toFixed(2)}</span>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center pt-2">
                <span className="font-medium">الإجمالي</span>
                <span className="font-bold text-xl text-primary">₪ {subtotal.toFixed(2)}</span>
              </div>
              <Button className="w-full mt-6" size="lg" onClick={() => router.push("/PaymentForm")}>
                المتابعة إلى الدفع
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}