"use client"

import type React from "react"
import { useState } from "react"
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth"
import { setDoc, doc } from "firebase/firestore"
import { auth, db } from "../../lib/firebase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardBody, CardHeader, Input, Button, Spinner } from "@nextui-org/react"
import { motion } from "framer-motion"
import { Logo } from "./Comp/Logo"
import FloatingBubblesBackground from "./Comp/FloatingBubblesBackground"

const MotionCard = motion(Card)

export default function Register() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [statusMessage, setStatusMessage] = useState("")
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setStatusMessage("")

    try {
      console.log("بدء عملية التسجيل...")
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      console.log("تم إنشاء المستخدم بنجاح:", user.uid)

      try {
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          name: username,
          role: "عميل",
        })
        console.log("تم حفظ تفاصيل المستخدم في Firestore")
      } catch (firestoreError) {
        console.error("خطأ في حفظ تفاصيل المستخدم في Firestore:", firestoreError)
        throw new Error("فشل في حفظ تفاصيل المستخدم. يرجى المحاولة مرة أخرى.")
      }

      try {
        console.log("محاولة إرسال بريد التحقق...")
        await sendEmailVerification(user)
        console.log("تم إرسال بريد التحقق بنجاح")
        setStatusMessage(
          "لقد أرسلنا بريد تحقق إلى صندوق الوارد الخاص بك. يرجى التحقق من بريدك الإلكتروني وتأكيد حسابك."
        )
      } catch (emailError: any) {
        console.error("خطأ في إرسال بريد التحقق:", emailError)
        if (emailError.code === "auth/too-many-requests") {
          setError("طلبات كثيرة جدًا. يرجى المحاولة مرة أخرى لاحقًا.")
        } else {
          setError(`فشل في إرسال بريد التحقق: ${emailError.message}`)
        }
        setIsLoading(false)
        return
      }

      setIsLoading(false)
      setStatusMessage("تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك.")
    } catch (error: any) {
      console.error("خطأ في عملية التسجيل:", error)
      if (error.code === "auth/email-already-in-use") {
        setError("هذا البريد الإلكتروني مستخدم بالفعل. يرجى استخدام بريد إلكتروني مختلف أو محاولة تسجيل الدخول.")
      } else if (error.code === "auth/invalid-email") {
        setError("عنوان البريد الإلكتروني غير صالح. يرجى التحقق والمحاولة مرة أخرى.")
      } else if (error.code === "auth/weak-password") {
        setError("كلمة المرور ضعيفة جدًا. يرجى استخدام كلمة مرور أقوى.")
      } else {
        setError(error.message || "حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.")
      }
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
          <CardHeader className="flex flex-col items-center pb-0 pt-8">
          <Logo  width={160} height={170} url="https://media.discordapp.net/attachments/1317885123361767445/1342092183158784020/9887e892-5770-45e7-8db4-b7e276d4e069.jpg?ex=67b8603f&is=67b70ebf&hm=c81468b8c175680327dfd7c3a0c4a4ad7a27bf967c222f33903b9e934c2429e8&=&format=webp&width=449&height=449" alt="Your Company Logo" />
            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mt-4">إنشاء حسابك</h2>
          </CardHeader>
          <CardBody className="px-8 py-6">
            <form onSubmit={handleRegister} className="space-y-6">
              <Input
                type="text"
                label="اسم المستخدم"
                placeholder="اختر اسم مستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                variant="bordered"
                className="max-w-full bg-white/50 dark:bg-gray-800/50 bg-transparent"
              />
              <Input
                type="email"
                label="البريد الإلكتروني"
                placeholder="أدخل بريدك الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                variant="bordered"
                className="max-w-full bg-white/50 dark:bg-gray-800/50 bg-transparent"
              />
              <Input
                type="password"
                label="كلمة المرور"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                variant="bordered"
                className="max-w-full bg-white/50 dark:bg-gray-800/50 bg-transparent"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {statusMessage && <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg text-blue-800 dark:text-blue-200 text-sm">{statusMessage}</div>}
              <Button
                type="submit"
                color="primary"
                className="w-full text-lg font-semibold py-6 bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? <Spinner color="white" size="sm" /> : "تسجيل"}
              </Button>
            </form>
            <div className="mt-4">
              <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                هل لديك حساب بالفعل؟{" "}
                <Link href="/auth/login" className="text-primary font-medium hover:underline">
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </CardBody>
        </MotionCard>
      </div>
    </FloatingBubblesBackground>
  )
}
