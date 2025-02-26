import { Body, Container, Head, Heading, Html, Img, Link, Preview, Section, Text } from "@react-email/components"

interface OrderConfirmationEmailProps {
  order: {
    id: string
    fullName: string
    shippingAddress: string
    cartItems: Array<{
      name: string
      price: number
      quantity: number
      selectedImageUrl: string
      selectedColor?: string
      selectedSize?: string
    }>
    subtotal: number
    deliveryFee: number
    total: number
  }
}

export default function OrderConfirmationEmail({ order }: OrderConfirmationEmailProps) {
  return (
    <Html dir="rtl">
      <Head />
      <Preview>تأكيد طلبك من Takkat</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>شكراً لطلبك من Takkat</Heading>

          <Section style={section}>
            <Heading style={h2}>تفاصيل الطلب #{order.id}</Heading>
            <Text style={text}>مرحباً {order.fullName}،</Text>
            <Text style={text}>نود إعلامك بأننا استلمنا طلبك وسنقوم بمعالجته في أقرب وقت ممكن.</Text>
          </Section>

          <Section style={section}>
            <Heading style={h2}>عنوان التوصيل</Heading>
            <Text style={text}>{order.shippingAddress}</Text>
          </Section>

          <Section style={section}>
            <Heading style={h2}>المنتجات المطلوبة</Heading>
            {order.cartItems.map((item, index) => (
              <div key={index} style={productContainer}>
                <Img src={item.selectedImageUrl} width="64" height="64" alt={item.name} style={productImage} />
                <div style={productDetails}>
                  <Text style={productName}>{item.name}</Text>
                  <Text style={productMeta}>
                    الكمية: {item.quantity}
                    {item.selectedColor && ` | اللون: ${item.selectedColor}`}
                    {item.selectedSize && ` | المقاس: ${item.selectedSize}`}
                  </Text>
                  <Text style={productPrice}>₪{(item.price * item.quantity).toFixed(2)}</Text>
                </div>
              </div>
            ))}
          </Section>

          <Section style={section}>
            <Heading style={h2}>ملخص الطلب</Heading>
            <div style={summaryContainer}>
              <div style={summaryRow}>
                <Text style={summaryLabel}>المجموع الفرعي:</Text>
                <Text style={summaryValue}>₪{order.subtotal.toFixed(2)}</Text>
              </div>
              <div style={summaryRow}>
                <Text style={summaryLabel}>رسوم التوصيل:</Text>
                <Text style={summaryValue}>₪{order.deliveryFee.toFixed(2)}</Text>
              </div>
              <div style={summaryRow}>
                <Text style={summaryLabel}>المجموع الكلي:</Text>
                <Text style={summaryValue}>₪{order.total.toFixed(2)}</Text>
              </div>
            </div>
          </Section>

          <Section style={section}>
            <Text style={text}>يمكنك متابعة حالة طلبك من خلال الرابط التالي:</Text>
            <Link href={`${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.id}`} style={button}>
              تتبع الطلب
            </Link>
          </Section>

          <Text style={footer}>شكراً لك على الطلب من Takkat. إذا كان لديك أي استفسارات، يرجى التواصل معنا.</Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily: "system-ui, sans-serif",
}

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "580px",
}

const section = {
  padding: "24px 0",
  borderBottom: "1px solid #e6e6e6",
}

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "16px 0",
  padding: "0",
  textAlign: "center" as const,
}

const h2 = {
  color: "#444",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0 0 16px",
}

const text = {
  color: "#333",
  fontSize: "16px",
  margin: "8px 0",
}

const productContainer = {
  display: "flex",
  margin: "12px 0",
  padding: "12px",
  backgroundColor: "#f9f9f9",
  borderRadius: "4px",
}

const productImage = {
  borderRadius: "4px",
  marginLeft: "12px",
}

const productDetails = {
  flex: "1",
}

const productName = {
  color: "#333",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 4px",
}

const productMeta = {
  color: "#666",
  fontSize: "14px",
  margin: "4px 0",
}

const productPrice = {
  color: "#333",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "4px 0 0",
}

const summaryContainer = {
  backgroundColor: "#f9f9f9",
  padding: "16px",
  borderRadius: "4px",
}

const summaryRow = {
  display: "flex",
  justifyContent: "space-between",
  margin: "8px 0",
}

const summaryLabel = {
  color: "#666",
  fontSize: "14px",
}

const summaryValue = {
  color: "#333",
  fontSize: "14px",
  fontWeight: "bold",
}

const button = {
  backgroundColor: "#000",
  borderRadius: "4px",
  color: "#fff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "16px 0",
  padding: "12px 24px",
  textDecoration: "none",
  textAlign: "center" as const,
}

const footer = {
  color: "#666",
  fontSize: "14px",
  fontStyle: "italic",
  margin: "24px 0 0",
  textAlign: "center" as const,
}

