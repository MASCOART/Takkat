import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { NextUIProvider } from "@nextui-org/react";
import { Noto_Kufi_Arabic } from "next/font/google"; // استيراد الخط

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["100", "200", "300", "400", "500", "700", "800", "900"], // الأوزان المطلوبة
  variable: "--font-noto-kufi",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextUIProvider>
      <main className={notoKufiArabic.className}>
        <Component {...pageProps} />
      </main>
    </NextUIProvider>
  );
}
