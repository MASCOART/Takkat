import type React from "react"
import { Image } from "@nextui-org/react"

interface LogoProps {
  url?: string
  alt: string
  width?: number
  height?: number
}

export const Logo: React.FC<LogoProps> = ({
  url = "https://marketplace.canva.com/EAFaFUz4aKo/2/0/1600w/canva-yellow-abstract-cooking-fire-free-logo-JmYWTjUsE-Q.jpg",
  alt,
  width = 100,
  height = 100,
}) => {
  return (
    <Image
      src={url || "/placeholder.svg"}
      alt={alt}
      width={width}
      height={height}
      className="mb-4 object-contain"
      fallbackSrc="/placeholder.svg"
    />
  )
}

