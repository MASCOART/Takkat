"use client"

import type React from "react"
import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../../lib/firebase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardBody, CardHeader, Input, Button, Spacer } from "@nextui-org/react"
import { motion } from "framer-motion"
import { Logo } from "./Comp/Logo"
import FloatingBubblesBackground from "./Comp/FloatingBubblesBackground"

const MotionCard = motion(Card)

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      if (user.emailVerified) {
        router.push("/home/Home")
      } else {
        setError("يرجى التحقق من بريدك الإلكتروني قبل تسجيل الدخول. تحقق من صندوق الوارد للحصول على رسالة التحقق.")
      }
    } catch (error: any) {
      console.error("خطأ في تسجيل الدخول:", error)
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.")
      } else if (error.code === "auth/too-many-requests") {
        setError("محاولات تسجيل دخول فاشلة كثيرة. يرجى المحاولة مرة أخرى لاحقًا.")
      } else {
        setError("حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FloatingBubblesBackground >
      <div dir="rtl" className="relative z-10 flex items-center justify-center  w-full">
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md shadow-lg bg-transparent backdrop-filter backdrop-blur-md backdrop-saturate-150 border border-white/20"
        >
          <CardHeader className="flex flex-col items-center pb-0 pt-6">
          <Logo  width={160} height={170} url="https://media.discordapp.net/attachments/1317885123361767445/1342092183158784020/9887e892-5770-45e7-8db4-b7e276d4e069.jpg?ex=67b8603f&is=67b70ebf&hm=c81468b8c175680327dfd7c3a0c4a4ad7a27bf967c222f33903b9e934c2429e8&=&format=webp&width=449&height=449" alt="Your Company Logo" />
            <h2 className="text-2xl font-bold mt-4 mb-2 text-gray-800 dark:text-gray-100">مرحبًا بعودتك</h2>
            <p className="text-center text-gray-600 dark:text-gray-300">سجل الدخول إلى حسابك</p>
          </CardHeader>
          <CardBody className="px-6 py-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                label="البريد الإلكتروني"
                placeholder="أدخل بريدك الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                variant="bordered"
                className="bg-white/50 dark:bg-gray-800/50 bg-transparent"
              />
              <Input
                type="password"
                label="كلمة المرور"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                variant="bordered"
                className="bg-white/50 dark:bg-gray-800/50 bg-transparent"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button
                type="submit"
                color="primary"
                className="w-full font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>
            </form>
            <Spacer y={4} />
            <p className="text-center text-sm">
              ليس لديك حساب؟{" "}
              <Link href="/auth/register" className="text-primary font-medium hover:underline">
                التسجيل
              </Link>
            </p>
          </CardBody>
        </MotionCard>
      </div>
    </FloatingBubblesBackground>
  )
}

