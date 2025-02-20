"use client"

import React from "react"
import { useState, useEffect } from "react"
import {
    Button,
    Input,
    Textarea,
    Checkbox,
    Select,
    SelectItem,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Tabs,
    Tab,
} from "@nextui-org/react"
import { Pencil, Trash, X, Eye, Plus, List } from "lucide-react"
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { HexColorPicker } from "react-colorful"

interface Product {
    id: string
    name: string
    sku: string
    description: string
    quantity: number
    price: number
    salePrice: number | null
    colors: { name: string; imageUrl: string }[]
    sizes: string[] // Ensure sizes is always an array
    isTopSeller: boolean
    isVisible: boolean
    categories: string[]
}

interface Category {
    id: string
    name: string
}

export default function ProductsManage() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [newProduct, setNewProduct] = useState<Omit<Product, "id" | "sku">>({
        name: "",
        description: "",
        quantity: 0,
        price: 0,
        salePrice: null,
        colors: [],
        sizes: [], // Initialize sizes as an empty array
        isTopSeller: false,
        isVisible: true,
        categories: [],
    })
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
    const [newColor, setNewColor] = useState({ name: "", imageUrl: "" })
    const [newSize, setNewSize] = useState("") // State for adding new sizes
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("")
    const [activeTab, setActiveTab] = useState("list")

    useEffect(() => {
        fetchProducts()
        fetchCategories()
    }, [])

    const fetchProducts = async () => {
        const productsCollection = collection(db, "products")
        const productsSnapshot = await getDocs(productsCollection)
        const productsList = productsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            sizes: doc.data().sizes || [], // Ensure sizes is always an array
        })) as Product[]
        setProducts(productsList)
    }

    const fetchCategories = async () => {
        const categoriesCollection = collection(db, "categories")
        const categoriesSnapshot = await getDocs(categoriesCollection)
        const categoriesList = categoriesSnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
        }))
        setCategories(categoriesList)
    }

    const generateSKU = () => {
        return Math.random().toString(36).substring(2, 10).toUpperCase()
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        if (editingProduct) {
            setEditingProduct({ ...editingProduct, [name]: value })
        } else {
            setNewProduct({ ...newProduct, [name]: value })
        }
    }

    const handleCheckboxChange = (name: string, checked: boolean) => {
        if (editingProduct) {
            setEditingProduct({ ...editingProduct, [name]: checked })
        } else {
            setNewProduct({ ...newProduct, [name]: checked })
        }
    }

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCategories = Array.from(e.target.selectedOptions || [], (option) => option.value)
        if (editingProduct) {
            setEditingProduct({ ...editingProduct, categories: selectedCategories })
        } else {
            setNewProduct({ ...newProduct, categories: selectedCategories })
        }
    }

    const handleColorChange = (color: string) => {
        setNewColor({ ...newColor, name: color })
    }

    const handleAddColor = async () => {
        let imageUrl = newColor.imageUrl

        if (imageFile) {
            const storageRef = ref(storage, `product-images/${imageFile.name}`)
            await uploadBytes(storageRef, imageFile)
            imageUrl = await getDownloadURL(storageRef)
        }

        if (!imageUrl) {
            alert("Please provide either a photo URL or upload an image.")
            return
        }

        const updatedColors = [
            ...(editingProduct?.colors || newProduct.colors),
            { ...newColor, imageUrl },
        ]

        if (editingProduct) {
            setEditingProduct({ ...editingProduct, colors: updatedColors })
        } else {
            setNewProduct({ ...newProduct, colors: updatedColors })
        }

        setNewColor({ name: "", imageUrl: "" })
        setImageFile(null)
    }

    const handleRemoveColor = (index: number) => {
        const updatedColors = editingProduct
            ? [...editingProduct.colors.slice(0, index), ...editingProduct.colors.slice(index + 1)]
            : [...newProduct.colors.slice(0, index), ...newProduct.colors.slice(index + 1)]

        if (editingProduct) {
            setEditingProduct({ ...editingProduct, colors: updatedColors })
        } else {
            setNewProduct({ ...newProduct, colors: updatedColors })
        }
    }

    const handleAddSize = () => {
        if (newSize.trim() === "") return

        const updatedSizes = [...(editingProduct ? editingProduct.sizes : newProduct.sizes), newSize.trim()]

        if (editingProduct) {
            setEditingProduct({ ...editingProduct, sizes: updatedSizes })
        } else {
            setNewProduct({ ...newProduct, sizes: updatedSizes })
        }

        setNewSize("")
    }

    const handleRemoveSize = (index: number) => {
        const updatedSizes = (editingProduct ? editingProduct.sizes : newProduct.sizes).filter((_, i) => i !== index)

        if (editingProduct) {
            setEditingProduct({ ...editingProduct, sizes: updatedSizes })
        } else {
            setNewProduct({ ...newProduct, sizes: updatedSizes })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const productData = editingProduct || { ...newProduct, sku: generateSKU() }

        if (editingProduct) {
            const productRef = doc(db, "products", editingProduct.id)
            await updateDoc(productRef, {
                name: productData.name,
                description: productData.description,
                quantity: Number(productData.quantity),
                price: Number(productData.price),
                salePrice: productData.salePrice ? Number(productData.salePrice) : null,
                colors: productData.colors,
                sizes: productData.sizes, // Ensure sizes is included
                isTopSeller: productData.isTopSeller,
                isVisible: productData.isVisible,
                categories: productData.categories,
            })
            setEditingProduct(null)
        } else {
            await addDoc(collection(db, "products"), {
                ...productData,
                quantity: Number(productData.quantity),
                price: Number(productData.price),
                salePrice: productData.salePrice ? Number(productData.salePrice) : null,
                sizes: productData.sizes, // Ensure sizes is included
            })
            setNewProduct({
                name: "",
                description: "",
                quantity: 0,
                price: 0,
                salePrice: null,
                colors: [],
                sizes: [], // Reset sizes
                isTopSeller: false,
                isVisible: true,
                categories: [],
            })
        }

        fetchProducts()
    }

    const handleEdit = (product: Product) => {
        setEditingProduct(product)
    }

    const handleDelete = async (id: string) => {
        await deleteDoc(doc(db, "products", id))
        fetchProducts()
    }

    const handleView = (product: Product) => {
        setViewingProduct(product)
        setIsViewModalOpen(true)
    }

    const filteredProducts = products.filter((product) => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === "" || product.categories.includes(selectedCategory)
        return matchesSearch && matchesCategory
    })

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Manage Products</h1>

            <Tabs
                aria-label="Product Management Options"
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key.toString())}
            >
                <Tab
                    key="list"
                    title={
                        <div className="flex items-center gap-2">
                            <List size={20} />
                            Product List
                        </div>
                    }
                >
                    <div className="mt-4">
                        <div className="mb-4 flex space-x-4">
                            <Input
                                placeholder="Search by name or SKU"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Select
                                placeholder="Filter by category"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <React.Fragment>
                                    <SelectItem key="all" value="">
                                        All Categories
                                    </SelectItem>
                                    {categories.map((category: Category) => (
                                        <SelectItem key={category.id} value={category.id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </React.Fragment>
                            </Select>
                        </div>

                        <Table aria-label="Products table">
                            <TableHeader>
                                <TableColumn>NAME</TableColumn>
                                <TableColumn>SKU</TableColumn>
                                <TableColumn>PRICE</TableColumn>
                                <TableColumn>SALE PRICE</TableColumn>
                                <TableColumn>QUANTITY</TableColumn>
                                <TableColumn>SIZES</TableColumn>
                                <TableColumn>ACTIONS</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {filteredProducts.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>{product.name}</TableCell>
                                        <TableCell>{product.sku}</TableCell>
                                        <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                                        <TableCell>
                                            {product.salePrice ? (
                                                <>
                                                    ${Number(product.salePrice).toFixed(2)}
                                                    <span className="ml-2 text-red-500">
                                                        ({((1 - Number(product.salePrice) / Number(product.price)) * 100).toFixed(0)}% off)
                                                    </span>
                                                </>
                                            ) : (
                                                "N/A"
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {product.quantity}
                                            {product.quantity === 0 && <span className="ml-2 text-red-500">Out of Stock</span>}
                                        </TableCell>
                                        <TableCell>{(product.sizes || []).join(", ")}</TableCell> 
                                        <TableCell>
                                            <Button isIconOnly color="primary" onClick={() => handleView(product)}>
                                                <Eye size={20} />
                                            </Button>
                                            <Button isIconOnly color="secondary" onClick={() => handleEdit(product)}>
                                                <Pencil size={20} />
                                            </Button>
                                            <Button isIconOnly color="danger" onClick={() => handleDelete(product.id)}>
                                                <Trash size={20} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Tab>
                <Tab
                    key="add"
                    title={
                        <div className="flex items-center gap-2">
                            <Plus size={20} />
                            Add Product
                        </div>
                    }
                >
                    <div className="mt-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Product Name"
                                name="name"
                                value={editingProduct ? editingProduct.name : newProduct.name}
                                onChange={handleInputChange}
                                required
                            />
                            <Textarea
                                label="Description"
                                name="description"
                                value={editingProduct ? editingProduct.description : newProduct.description}
                                onChange={handleInputChange}
                                required
                            />
                            <Input
                                type="number"
                                label="Quantity"
                                name="quantity"
                                value={editingProduct ? editingProduct.quantity.toString() : newProduct.quantity.toString()}
                                onChange={handleInputChange}
                                required
                            />
                            <Input
                                type="number"
                                label="Price"
                                name="price"
                                value={editingProduct ? editingProduct.price.toString() : newProduct.price.toString()}
                                onChange={handleInputChange}
                                required
                            />
                            <Input
                                type="number"
                                label="Sale Price (optional)"
                                name="salePrice"
                                value={
                                    editingProduct ? editingProduct.salePrice?.toString() || "" : newProduct.salePrice?.toString() || ""
                                }
                                onChange={handleInputChange}
                            />
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Colors</h3>
                                <div className="flex space-x-4 mb-4">
                                    <HexColorPicker color={newColor.name} onChange={handleColorChange} />
                                    <div>
                                        <Input
                                            label="Color Name"
                                            value={newColor.name}
                                            onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                                        />
                                        <Input
                                            type="file"
                                            label="Upload Image"
                                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                            accept="image/*"
                                        />
                                        <Input
                                            label="Or Enter Image URL"
                                            value={newColor.imageUrl}
                                            onChange={(e) => setNewColor({ ...newColor, imageUrl: e.target.value })}
                                        />
                                        <Button onClick={handleAddColor}>Add Color</Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    {(editingProduct ? editingProduct.colors : newProduct.colors).map((color, index) => (
                                        <div key={index} className="border p-2 rounded">
                                            <div className="w-8 h-8 rounded" style={{ backgroundColor: color.name }}></div>
                                            <p>{color.name}</p>
                                            <img
                                                src={color.imageUrl || "/placeholder.svg"}
                                                alt={color.name}
                                                className="w-full h-32 object-cover rounded mt-2"
                                            />
                                            <Button isIconOnly color="danger" onClick={() => handleRemoveColor(index)}>
                                                <X size={20} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Sizes</h3>
                                <div className="flex space-x-4 mb-4">
                                    <Input
                                        label="Size"
                                        value={newSize}
                                        onChange={(e) => setNewSize(e.target.value)}
                                    />
                                    <Button onClick={handleAddSize}>Add Size</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(editingProduct ? editingProduct.sizes : newProduct.sizes).map((size, index) => (
                                        <div key={index} className="border p-2 rounded flex items-center gap-2">
                                            <span>{size}</span>
                                            <Button isIconOnly color="danger" size="sm" onClick={() => handleRemoveSize(index)}>
                                                <X size={16} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Checkbox
                                isSelected={editingProduct ? editingProduct.isTopSeller : newProduct.isTopSeller}
                                onValueChange={(checked) => handleCheckboxChange("isTopSeller", checked)}
                            >
                                Top Seller
                            </Checkbox>
                            <Checkbox
                                isSelected={editingProduct ? editingProduct.isVisible : newProduct.isVisible}
                                onValueChange={(checked) => handleCheckboxChange("isVisible", checked)}
                            >
                                Visible
                            </Checkbox>
                            <Select
                                label="Categories"
                                selectionMode="multiple"
                                selectedKeys={editingProduct ? editingProduct.categories : newProduct.categories}
                                onSelectionChange={(keys) => {
                                    const selectedCategories = Array.from(keys) as string[]
                                    if (editingProduct) {
                                        setEditingProduct({ ...editingProduct, categories: selectedCategories })
                                    } else {
                                        setNewProduct({ ...newProduct, categories: selectedCategories })
                                    }
                                }}
                            >
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </Select>
                            <Button color="primary" type="submit">
                                {editingProduct ? "Update Product" : "Add Product"}
                            </Button>
                        </form>
                    </div>
                </Tab>
            </Tabs>

            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
                <ModalContent>
                    <ModalHeader>Product Details</ModalHeader>
                    <ModalBody>
                        {viewingProduct && (
                            <div className="space-y-4">
                                <p>
                                    <strong>Name:</strong> {viewingProduct.name}
                                </p>
                                <p>
                                    <strong>SKU:</strong> {viewingProduct.sku}
                                </p>
                                <p>
                                    <strong>Description:</strong> {viewingProduct.description}
                                </p>
                                <p>
                                    <strong>Price:</strong> ${Number(viewingProduct.price).toFixed(2)}
                                </p>
                                {viewingProduct.salePrice && (
                                    <p>
                                        <strong>Sale Price:</strong> ${Number(viewingProduct.salePrice).toFixed(2)}
                                    </p>
                                )}
                                <p>
                                    <strong>Quantity:</strong> {viewingProduct.quantity}
                                </p>
                                <p>
                                    <strong>Top Seller:</strong> {viewingProduct.isTopSeller ? "Yes" : "No"}
                                </p>
                                <p>
                                    <strong>Visible:</strong> {viewingProduct.isVisible ? "Yes" : "No"}
                                </p>
                                <div>
                                    <strong>Colors:</strong>
                                    <div className="grid grid-cols-3 gap-4 mt-2">
                                        {viewingProduct.colors.map((color, index) => (
                                            <div key={index} className="border p-2 rounded">
                                                <div className="w-8 h-8 rounded" style={{ backgroundColor: color.name }}></div>
                                                <p>{color.name}</p>
                                                <img
                                                    src={color.imageUrl || "/placeholder.svg"}
                                                    alt={color.name}
                                                    className="w-full h-32 object-cover rounded mt-2"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <strong>Sizes:</strong>
                                    <ul className="list-disc list-inside">
                                        {(viewingProduct.sizes || []).map((size, index) => ( // Safely handle undefined sizes
                                            <li key={index}>{size}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <strong>Categories:</strong>
                                    <ul className="list-disc list-inside">
                                        {viewingProduct.categories.map((categoryId) => (
                                            <li key={categoryId}>
                                                {categories.find((c) => c.id === categoryId)?.name || "Unknown Category"}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => setIsViewModalOpen(false)}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    )
}