import { Button, Link } from "@nextui-org/react"
import Game from "./Game/Game"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center ">
             <Button className="bg-black mt-10 text-white">
                <Link href="/Home" className="text-white">
                Home
                </Link>
                
                </Button>

     <Game/>
    </main>
  )
}

