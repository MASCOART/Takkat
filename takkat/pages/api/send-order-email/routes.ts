import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { order, customerEmail } = body

    // Validate required fields
    if (!order || !customerEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
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
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">تأكيد الطلب #${order.id}</h1>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #444;">معلومات الطلب</h2>
          <p><strong>الاسم:</strong> ${order.fullName}</p>
          <p><strong>البريد الإلكتروني:</strong> ${order.email}</p>
          <p><strong>رقم الهاتف:</strong> ${order.phoneNumber}</p>
          <p><strong>عنوان التوصيل:</strong> ${order.shippingAddress}</p>
        </div>

        <div style="margin: 20px 0;">
          <h2 style="color: #444;">المنتجات المطلوبة</h2>
          ${order.cartItems
            .map(
              (item: any) => `
            <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
              <div style="display: flex; justify-content: space-between;">
                <div>
                  <p style="margin: 5px 0;"><strong>${item.name}</strong></p>
                  <p style="margin: 5px 0; color: #666;">
                    الكمية: ${item.quantity}
                    ${item.color ? ` | اللون: ${item.color}` : ""}
                    ${item.size ? ` | المقاس: ${item.size}` : ""}
                  </p>
                </div>
                <p style="margin: 5px 0;"><strong>₪${(item.price * item.quantity).toFixed(2)}</strong></p>
              </div>
            </div>
          `,
            )
            .join("")}
        </div>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #444;">ملخص الطلب</h2>
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

        <div style="text-align: center; margin: 30px 0;">
          <p>يمكنك متابعة حالة طلبك من خلال الرابط التالي:</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/orders/${order.id}" 
             style="display: inline-block; background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
            تتبع الطلب
          </a>
        </div>

        <div style="text-align: center; color: #666; margin-top: 30px;">
          <p>شكراً لك على الطلب من Takkat.</p>
          <p>إذا كان لديك أي استفسارات، يرجى التواصل معنا.</p>
        </div>
      </div>
    `

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

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
    })
  } catch (error: any) {
    console.error("Email sending error:", error)
    return NextResponse.json(
      {
        error: "Failed to send email",
        details: error.message,
      },
      {
        status: 500,
      },
    )
  }
}