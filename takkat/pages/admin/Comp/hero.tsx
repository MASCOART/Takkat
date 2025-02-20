"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { db, auth, storage } from "@/lib/firebase"
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useAuthState } from "react-firebase-hooks/auth"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import {
  Button,
  Input,
  Textarea,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Image,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react"
import { Trash } from "lucide-react"

interface HeroSlide {
  id: string
  title: string
  description: string
  imageUrl: string
  linkUrl: string
}

const HeroManage = () => {
  const [user, loading] = useAuthState(auth)
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [newSlide, setNewSlide] = useState<Omit<HeroSlide, "id">>({
    title: "",
    description: "",
    imageUrl: "",
    linkUrl: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchSlides()
    }
  }, [user])

  const fetchSlides = async () => {
    const slidesCollection = collection(db, "heroSlides")
    const slidesSnapshot = await getDocs(slidesCollection)
    const slidesList = slidesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as HeroSlide[]
    setSlides(slidesList)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewSlide({ ...newSlide, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert("You must be logged in to add a slide.")
      return
    }

    setIsUploading(true)

    try {
      let imageUrl = newSlide.imageUrl

      if (imageFile) {
        const storageRef = ref(storage, `hero-images/${imageFile.name}`)
        await uploadBytes(storageRef, imageFile)
        imageUrl = await getDownloadURL(storageRef)
      }

      const slideData = { ...newSlide, imageUrl }
      const docRef = await addDoc(collection(db, "heroSlides"), slideData)
      console.log("Document written with ID: ", docRef.id)
      setNewSlide({ title: "", description: "", imageUrl: "", linkUrl: "" })
      setImageFile(null)
      fetchSlides()
    } catch (e) {
      console.error("Error adding document: ", e)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "heroSlides", id))
      fetchSlides()
    } catch (e) {
      console.error("Error deleting document: ", e)
    }
  }

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error("Error signing in with Google: ", error)
    }
  }

  if (loading) {
    return <Spinner label="Loading..." />
  }

  if (!user) {
    return (
      <Card className="max-w-sm mx-auto mt-8">
        <CardBody className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to manage hero slides</h2>
          <Button color="primary" onClick={handleSignIn}>
            Sign in with Google
          </Button>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Hero Slides</h1>
      <Card className="mb-8">
        <CardHeader>
          <h2 className="text-lg font-semibold">Add New Hero Slide</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Title" name="title" value={newSlide.title} onChange={handleChange} required />
            <Textarea
              label="Description"
              name="description"
              value={newSlide.description}
              onChange={handleChange}
              required
            />
            <Input type="file" label="Upload Image" onChange={handleImageChange} accept="image/*" />
            <Input
              label="Image URL (optional)"
              name="imageUrl"
              value={newSlide.imageUrl}
              onChange={handleChange}
              placeholder="Leave empty if uploading an image"
            />
            <Input label="Link URL" name="linkUrl" value={newSlide.linkUrl} onChange={handleChange} required />
          </form>
        </CardBody>
        <CardFooter>
          <Button color="primary" onClick={handleSubmit} disabled={isUploading}>
            {isUploading ? <Spinner size="sm" /> : "Add Slide"}
          </Button>
        </CardFooter>
      </Card>

      <h2 className="text-xl font-semibold mb-4">Existing Slides</h2>
      <Table aria-label="Existing hero slides">
        <TableHeader>
          <TableColumn>IMAGE</TableColumn>
          <TableColumn>TITLE</TableColumn>
          <TableColumn>DESCRIPTION</TableColumn>
          <TableColumn>LINK</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {slides.map((slide) => (
            <TableRow key={slide.id}>
              <TableCell>
                <Image
                  src={slide.imageUrl || "/placeholder.svg"}
                  alt={slide.title}
                  width={100}
                  height={100}
                  className="object-cover"
                />
              </TableCell>
              <TableCell>{slide.title}</TableCell>
              <TableCell>{slide.description.substring(0, 50)}...</TableCell>
              <TableCell>{slide.linkUrl}</TableCell>
              <TableCell>
                <Button isIconOnly color="danger" aria-label="Delete" onClick={() => handleDelete(slide.id)}>
                  <Trash size={20} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default HeroManage

