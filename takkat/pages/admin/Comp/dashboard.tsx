"use client"
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  User,
  Chip,
  Progress,
} from "@nextui-org/react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { name: "Jan", total: 1500 },
  { name: "Feb", total: 2300 },
  { name: "Mar", total: 3200 },
  { name: "Apr", total: 2800 },
  { name: "May", total: 3600 },
  { name: "Jun", total: 4100 },
  { name: "Jul", total: 3800 },
  { name: "Aug", total: 4300 },
  { name: "Sep", total: 4700 },
  { name: "Oct", total: 5100 },
  { name: "Nov", total: 4800 },
  { name: "Dec", total: 5500 },
]

const recentSales = [
  {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    amount: "+$1,999.00",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  },
  {
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    amount: "+$39.00",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    amount: "+$299.00",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
  },
  {
    name: "William Kim",
    email: "will@email.com",
    amount: "+$99.00",
    avatar: "https://i.pravatar.cc/150?u=a048581f4e29026701d",
  },
  {
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    amount: "+$39.00",
    avatar: "https://i.pravatar.cc/150?u=a092581d4ef9026700d",
  },
]

export function Dashboard() {
  return (
    <div className="space-y-4 p-8">
      <h2 className="text-3xl font-bold">Dashboard</h2>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard title="Total Revenue" value="$45,231.89" change="+20.1%" />
        <SummaryCard title="Subscriptions" value="2,350" change="+180.1%" />
        <SummaryCard title="Sales" value="12,234" change="+19%" />
        <SummaryCard title="Active Now" value="573" change="+201" />
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <h3 className="text-xl font-semibold">Overview</h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip />
                <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <h3 className="text-xl font-semibold">Recent Sales</h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <Table aria-label="Recent sales table">
              <TableHeader>
                <TableColumn>USER</TableColumn>
                <TableColumn>AMOUNT</TableColumn>
              </TableHeader>
              <TableBody>
                {recentSales.map((sale, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <User name={sale.name} description={sale.email} avatarProps={{ src: sale.avatar }} />
                    </TableCell>
                    <TableCell>{sale.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard title="Customer Satisfaction" value="98%" description="Based on 3,200 reviews" progress={98} />
        <MetricCard
          title="Monthly Recurring Revenue"
          value="$12,500"
          description="+15% from last month"
          progress={75}
        />
        <MetricCard title="New Customers" value="120" description="This week" progress={60} />
      </div>
    </div>
  )
}

interface SummaryCardProps {
  title: string
  value: string
  change: string
}

function SummaryCard({ title, value, change }: SummaryCardProps) {
  return (
    <Card>
      <CardBody>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-default-500">{title}</p>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
          <Chip color="success" variant="flat">
            {change}
          </Chip>
        </div>
      </CardBody>
    </Card>
  )
}

interface MetricCardProps {
  title: string
  value: string
  description: string
  progress: number
}

function MetricCard({ title, value, description, progress }: MetricCardProps) {
  return (
    <Card>
      <CardBody>
        <h4 className="text-lg font-semibold">{title}</h4>
        <p className="text-2xl font-bold mt-2">{value}</p>
        <p className="text-sm text-default-500 mt-1">{description}</p>
        <Progress
          value={progress}
          className="mt-4"
          color={progress > 66 ? "success" : progress > 33 ? "warning" : "danger"}
        />
      </CardBody>
    </Card>
  )
}

