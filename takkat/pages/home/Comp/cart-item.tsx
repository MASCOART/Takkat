import Image from "next/image"
import { Minus, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CartItemProps {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  onRemove: (id: string) => void
  onUpdateQuantity: (id: string, quantity: number) => void
}

export function CartItem({ id, name, price, quantity, image, onRemove, onUpdateQuantity }: CartItemProps) {
  return (
    <div className="flex items-start gap-4 py-4">
      <div className="relative h-24 w-24 overflow-hidden rounded-lg">
        <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div>
            <h3 className="font-medium">{name}</h3>
            <p className="text-sm text-muted-foreground">${price.toFixed(2)}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemove(id)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateQuantity(id, quantity - 1)}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center">{quantity}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onUpdateQuantity(id, quantity + 1)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

