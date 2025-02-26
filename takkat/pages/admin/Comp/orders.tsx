"use client"

import { useState, useEffect, useCallback } from "react"
import { collection, query, getDocs, orderBy, limit, startAfter, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Card,
  CardHeader,
  CardBody,
  Tabs,
  Tab,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  Select,
  SelectItem,
  Image,
} from "@nextui-org/react"
import { ChevronDown, Search, Calendar } from "lucide-react"

interface Order {
  id: string
  fullName: string
  email: string
  total: number
  status: string
  createdAt: any
  cartItems: Array<{
    id: string
    name: string
    quantity: number
    image: string
  }>
}

const ITEMS_PER_PAGE = 10

const statusOptions = [
  { key: "all", label: "جميع الحالات" },
  { key: "pending", label: "قيد الانتظار" },
  { key: "processing", label: "قيد المعالجة" },
  { key: "shipped", label: "تم الشحن" },
  { key: "delivered", label: "تم التوصيل" },
  { key: "cancelled", label: "ملغي" },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("orders")
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [lastVisible, setLastVisible] = useState<any>(null)
  const [selectedItem, setSelectedItem] = useState<Order | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("")
  const [completedOrdersCount, setCompletedOrdersCount] = useState(0)
  const [shippedOrdersCount, setShippedOrdersCount] = useState(0)

  const fetchItems = useCallback(async () => {
    const ordersRef = collection(db, "orders")
    const q = query(ordersRef, orderBy("createdAt", "desc"), limit(ITEMS_PER_PAGE))
    const querySnapshot = await getDocs(q)
    const fetchedOrders: Order[] = []
    querySnapshot.forEach((doc) => {
      fetchedOrders.push({ id: doc.id, ...doc.data() } as Order)
    })
    setOrders(fetchedOrders)
    setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1])
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  useEffect(() => {
    setFilteredOrders(filterOrders())
    const completed = orders.filter((order) => order.status === "delivered").length
    const shipped = orders.filter((order) => order.status === "shipped").length
    setCompletedOrdersCount(completed)
    setShippedOrdersCount(shipped)
  }, [orders, searchTerm, statusFilter, dateFilter])

  const fetchMoreItems = async () => {
    if (!lastVisible) return

    const ordersRef = collection(db, "orders")
    const q = query(ordersRef, orderBy("createdAt", "desc"), startAfter(lastVisible), limit(ITEMS_PER_PAGE))
    const querySnapshot = await getDocs(q)
    const newOrders: Order[] = []
    querySnapshot.forEach((doc) => {
      newOrders.push({ id: doc.id, ...doc.data() } as Order)
    })
    setOrders((prevOrders) => [...prevOrders, ...newOrders])
    setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1])
    setCurrentPage((prevPage) => prevPage + 1)
  }

  const handleItemClick = (item: Order) => {
    setSelectedItem(item)
    onOpen()
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus })
      setOrders((prevOrders) =>
        prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)),
      )
    } catch (error) {
      console.error("خطأ في تحديث حالة الطلب:", error)
    }
  }

  const filterOrders = useCallback(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      const matchesDate =
        !dateFilter || new Date(order.createdAt.toDate()).toDateString() === new Date(dateFilter).toDateString()
      return matchesSearch && matchesStatus && matchesDate
    })
  }, [orders, searchTerm, statusFilter, dateFilter])

  return (
    <div className="min-h-screen p-8 bg-gray-50" dir="rtl">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-800">لوحة الإدارة</h1>

      <div className="bg-white p-4 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-blue-800">إحصائيات سريعة</h2>
          <div className="text-lg">
            <span className="font-bold text-green-600 ml-4">{completedOrdersCount}</span> طلبات مكتملة
            <span className="font-bold text-blue-600 ml-4">{shippedOrdersCount}</span> طلبات تم شحنها
          </div>
        </div>
      </div>

      <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(key as string)} className="mb-8">
        <Tab key="orders" title="جميع الطلبات" />
        <Tab key="shipped" title="الطلبات المشحونة والمكتملة" />
      </Tabs>

      <Card className="mb-8">
        <CardHeader className="bg-blue-100">
          <h2 className="text-2xl font-semibold text-blue-800">
            {activeTab === "orders" ? "قائمة جميع الطلبات" : "الطلبات المشحونة والمكتملة"}
          </h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-4 mb-4">
            <Input
              placeholder="البحث بالاسم أو البريد الإلكتروني"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startContent={<Search className="text-gray-400" />}
              className="max-w-xs"
            />
            <Select
              placeholder="تصفية حسب الحالة"
              selectedKeys={[statusFilter]}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="max-w-xs"
            >
              {statusOptions.map((status) => (
                <SelectItem key={status.key} value={status.key}>
                  {status.label}
                </SelectItem>
              ))}
            </Select>
            <Input
              type="date"
              placeholder="تصفية حسب التاريخ"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              startContent={<Calendar className="text-gray-400" />}
              className="max-w-xs"
            />
          </div>
          <Table aria-label="جدول الطلبات">
            <TableHeader>
              <TableColumn>رقم الطلب</TableColumn>
              <TableColumn>اسم العميل</TableColumn>
              <TableColumn>البريد الإلكتروني</TableColumn>
              <TableColumn>المنتجات</TableColumn>
              <TableColumn>المجموع</TableColumn>
              <TableColumn>الحالة</TableColumn>
              <TableColumn>التاريخ</TableColumn>
              <TableColumn>الإجراءات</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredOrders
                .filter((order) => activeTab === "orders" || ["shipped", "delivered"].includes(order.status))
                .map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.fullName}</TableCell>
                    <TableCell>{order.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {order.cartItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              width={40}
                              height={40}
                              className="object-cover rounded"
                            />
                            <span>
                              {item.name} (x{item.quantity})
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>₪{order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button variant="bordered" className="capitalize">
                            {statusOptions.find((status) => status.key === order.status)?.label}
                            <ChevronDown className="mr-2 h-4 w-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                          aria-label="اختيار الحالة"
                          onAction={(key) => handleStatusChange(order.id, key as string)}
                        >
                          {statusOptions.slice(1).map((status) => (
                            <DropdownItem key={status.key}>{status.label}</DropdownItem>
                          ))}
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                    <TableCell>{new Date(order.createdAt.toDate()).toLocaleString("ar-EG")}</TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => handleItemClick(order)}>
                        عرض التفاصيل
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <div className="flex justify-center">
        <Pagination
          total={Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)}
          page={currentPage}
          onChange={(page) => {
            setCurrentPage(page)
            if (page > currentPage) {
              fetchMoreItems()
            }
          }}
        />
      </div>

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">تفاصيل الطلب</ModalHeader>
          <ModalBody>
            {selectedItem && (
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600">رقم الطلب:</span>
                  <span className="text-lg">{selectedItem.id}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600">اسم العميل:</span>
                  <span className="text-lg">{selectedItem.fullName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600">البريد الإلكتروني:</span>
                  <span className="text-lg">{selectedItem.email}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600">المنتجات:</span>
                  <div className="space-y-2">
                    {selectedItem.cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={60}
                          height={60}
                          className="object-cover rounded"
                        />
                        <span>
                          {item.name} (x{item.quantity})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600">المجموع:</span>
                  <span className="text-lg">₪{selectedItem.total.toFixed(2)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600">الحالة:</span>
                  <span className="text-lg">
                    {statusOptions.find((status) => status.key === selectedItem.status)?.label}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-600">تاريخ الطلب:</span>
                  <span className="text-lg">{new Date(selectedItem.createdAt.toDate()).toLocaleString("ar-EG")}</span>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              إغلاق
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

