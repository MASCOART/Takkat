import { NextApiRequest, NextApiResponse } from "next"
import nodemailer from "nodemailer"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const { order, customerEmail } = req.body

      // Validate required fields
      if (!order || !customerEmail) {
        return res.status(400).json({ error: "Missing required fields" })
      }

      // Validate cartItems
      if (!order.cartItems || order.cartItems.length === 0) {
        return res.status(400).json({ error: "Cart items are missing or empty" })
      }

      // Create transporter for sending emails
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      })

      // Create email HTML
      const emailHtml = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
        <h1 style="color: #333; text-align: center; margin-bottom: 20px;">تأكيد الطلب #${order.id}</h1>
        
        <!-- Order Information -->
        <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #444; margin-bottom: 15px;">معلومات الطلب</h2>
          <p style="margin: 5px 0;"><strong>الاسم:</strong> ${order.fullName}</p>
          <p style="margin: 5px 0;"><strong>البريد الإلكتروني:</strong> ${order.email}</p>
          <p style="margin: 5px 0;"><strong>رقم الهاتف:</strong> ${order.phoneNumber}</p>
          <p style="margin: 5px 0;"><strong>عنوان التوصيل:</strong> ${order.shippingAddress}</p>
        </div>
    
        <!-- Ordered Products -->
        <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #444; margin-bottom: 15px;">المنتجات المطلوبة</h2>
          ${order.cartItems
            .map(
              (item: any) => `
            <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />
                <div>
                  <p style="margin: 5px 0; font-weight: bold;">${item.name}</p>
                  <p style="margin: 5px 0; color: #666;">
                    الكمية: ${item.quantity}
                    ${item.color ? ` | اللون: ${item.color}` : ""}
                    ${item.size ? ` | المقاس: ${item.size}` : ""}
                  </p>
                </div>
                <p style="margin: 5px 0; font-weight: bold; margin-left: auto;">₪${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
    
        <!-- Order Summary -->
        <div style="background-color: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #444; margin-bottom: 15px;">ملخص الطلب</h2>
          <div style="display: flex; justify-content: space-between; margin: 10px 0;">
            <span>المجموع الفرعي:</span>
            <span>₪${order.subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 10px 0;">
            <span>رسوم التوصيل:</span>
            <span>₪${order.deliveryFee.toFixed(2)}</span>
          </div>
          ${
            order.discount > 0
              ? `
            <div style="display: flex; justify-content: space-between; margin: 10px 0; color: #22c55e;">
              <span>الخصم:</span>
              <span>-₪${order.discount.toFixed(2)}</span>
            </div>
          `
              : ""
          }
          <div style="display: flex; justify-content: space-between; margin: 10px 0; font-weight: bold; font-size: 1.1em;">
            <span>المجموع الكلي:</span>
            <span>₪${order.total.toFixed(2)}</span>
          </div>
        </div>
    
        <!-- Order Tracking Link -->
        <div style="text-align: center; margin: 30px 0;">
          <p style="margin-bottom: 10px;">يمكنك متابعة حالة طلبك من خلال الرابط التالي:</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.id}" 
             style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            تتبع الطلب
          </a>
        </div>
    
        <!-- Footer -->
        <div style="text-align: center; color: #666; margin-top: 30px;">
          <p>شكراً لك على الطلب من Takkat.</p>
          <p>إذا كان لديك أي استفسارات، يرجى التواصل معنا.</p>
        </div>
      </div>
    `;

      // Send email
      const info = await transporter.sendMail({
        from: {
          name: "Takkat Store",
          address: process.env.EMAIL_USER as string,
        },
        to: customerEmail,
        subject: `تأكيد الطلب #${order.id}`,
        html: emailHtml,
      })

      return res.status(200).json({
        success: true,
        messageId: info.messageId,
      })
    } catch (error: any) {
      console.error("Email sending error:", error)
      return res.status(500).json({
        error: "Failed to send email",
        details: error.message,
      })
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" })
  }
}