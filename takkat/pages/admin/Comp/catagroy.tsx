"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button, Input, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react"
import { Pencil, Trash } from "lucide-react"
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"

interface Category {
  id: string
  name: string
  imageUrl: string
}

export default function CategoriesManage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState({ name: "", imageUrl: "" })
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const categoriesCollection = collection(db, "categories")
    const categoriesSnapshot = await getDocs(categoriesCollection)
    const categoriesList = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Category[]
    setCategories(categoriesList)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (editingCategory) {
      setEditingCategory({ ...editingCategory, [name]: value })
    } else {
      setNewCategory({ ...newCategory, [name]: value })
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    let imageUrl = editingCategory ? editingCategory.imageUrl : newCategory.imageUrl

    if (imageFile) {
      const storageRef = ref(storage, `category-images/${imageFile.name}`)
      await uploadBytes(storageRef, imageFile)
      imageUrl = await getDownloadURL(storageRef)
    }

    if (editingCategory) {
      const categoryRef = doc(db, "categories", editingCategory.id)
      await updateDoc(categoryRef, { ...editingCategory, imageUrl })
      setEditingCategory(null)
    } else {
      await addDoc(collection(db, "categories"), { ...newCategory, imageUrl })
      setNewCategory({ name: "", imageUrl: "" })
    }

    setImageFile(null)
    fetchCategories()
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
  }

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "categories", id))
    fetchCategories()
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Categories</h1>
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col gap-4">
          <Input
            label="Category Name"
            name="name"
            value={editingCategory ? editingCategory.name : newCategory.name}
            onChange={handleInputChange}
            required
          />
          <Input type="file" label="Category Image" onChange={handleImageChange} accept="image/*" />
          <Input
            label="Image URL (optional)"
            name="imageUrl"
            value={editingCategory ? editingCategory.imageUrl : newCategory.imageUrl}
            onChange={handleInputChange}
            placeholder="Or enter image URL"
          />
          <Button color="primary" type="submit">
            {editingCategory ? "Update Category" : "Add Category"}
          </Button>
        </div>
      </form>

      <Table aria-label="Categories table">
        <TableHeader>
          <TableColumn>NAME</TableColumn>
          <TableColumn>IMAGE</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>{category.name}</TableCell>
              <TableCell>
                <img
                  src={category.imageUrl || "/placeholder.svg"}
                  alt={category.name}
                  className="w-16 h-16 object-cover rounded-full"
                />
              </TableCell>
              <TableCell>
                <Button isIconOnly color="primary" onClick={() => handleEdit(category)}>
                  <Pencil size={20} />
                </Button>
                <Button isIconOnly color="danger" onClick={() => handleDelete(category.id)}>
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

