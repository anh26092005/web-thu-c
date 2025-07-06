import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { renderOrderConfirmationEmail, OrderEmailData } from "@/lib/email-templates";

// Khởi tạo Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// API endpoint gửi email xác nhận đơn hàng
export async function POST(request: NextRequest) {
  try {
    // Log debug cấu hình environment
    console.log("=== EMAIL API DEBUG ===");
    console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);
    console.log("RESEND_FROM_EMAIL:", process.env.RESEND_FROM_EMAIL);
    console.log("Request URL:", request.url);
    console.log("Request method:", request.method);

    const emailData: OrderEmailData = await request.json();
    console.log("Email data received:", {
      orderNumber: emailData.orderNumber,
      customerEmail: emailData.customerEmail,
      storeName: emailData.storeName,
    });

    // Validation dữ liệu cơ bản
    if (!emailData.customerEmail || !emailData.orderNumber) {
      console.log("Validation failed: missing email or order number");
      return NextResponse.json(
        { 
          success: false, 
          message: "Thiếu thông tin email khách hàng hoặc mã đơn hàng" 
        },
        { status: 400 }
      );
    }

    // Kiểm tra RESEND_API_KEY
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY không được cấu hình");
      return NextResponse.json(
        { 
          success: false, 
          message: "Cấu hình email chưa sẵn sàng",
          debug: "RESEND_API_KEY not found in environment variables"
        },
        { status: 500 }
      );
    }

    // Kiểm tra RESEND_FROM_EMAIL
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    console.log("Using from email:", fromEmail);

    // Tạo HTML content từ template
    console.log("Generating HTML content...");
    const htmlContent = renderOrderConfirmationEmail(emailData);
    console.log("HTML content length:", htmlContent.length);

    // Gửi email qua Resend
    console.log("Sending email via Resend...");
    const emailResponse = await resend.emails.send({
      from: fromEmail,
      // to: [emailData.customerEmail],
      to: ["khunglongchaucompany@gmail.com"],
      subject: `Xác nhận đơn hàng #${emailData.orderNumber} từ ${emailData.storeName}`,
      html: htmlContent,
      // Thêm text version cho email client không hỗ trợ HTML
      text: `
        Xác nhận đơn hàng #${emailData.orderNumber} từ ${emailData.storeName}
        
        Chào ${emailData.customerName},
        
        Cảm ơn bạn đã tin tưởng và mua sắm tại ${emailData.storeName}!
        
        Thông tin đơn hàng:
        - Mã đơn hàng: ${emailData.orderNumber}
        - Ngày đặt hàng: ${emailData.orderDate}
        - Tổng tiền: ${emailData.totalAmount.toLocaleString()}đ
        - Phương thức thanh toán: ${emailData.paymentMethod === 'cod' ? 'COD' : 'VNPAY'}
        
        Địa chỉ giao hàng:
        ${emailData.shippingAddress.street}, ${emailData.shippingAddress.ward}, ${emailData.shippingAddress.province}
        
        Thời gian giao hàng dự kiến: ${emailData.estimatedDeliveryDays} ngày
        
        Liên hệ hỗ trợ: ${emailData.supportPhone}
        Email hỗ trợ: ${emailData.supportEmail}
        
        Trân trọng,
        ${emailData.storeName}
      `,
    });

    console.log("Resend response:", emailResponse);

    // Kiểm tra kết quả gửi email
    if (emailResponse.error) {
      console.error("Lỗi gửi email:", emailResponse.error);
      return NextResponse.json(
        { 
          success: false, 
          message: "Không thể gửi email xác nhận", 
          error: emailResponse.error,
          debug: "Resend API returned error"
        },
        { status: 500 }
      );
    }

    console.log("Email xác nhận đã được gửi thành công:", {
      emailId: emailResponse.data?.id,
      to: emailData.customerEmail,
      orderNumber: emailData.orderNumber,
    });

    return NextResponse.json({
      success: true,
      message: "Email xác nhận đơn hàng đã được gửi thành công",
      data: {
        emailId: emailResponse.data?.id,
        to: emailData.customerEmail,
        orderNumber: emailData.orderNumber,
      },
    });

  } catch (error) {
    console.error("Lỗi trong quá trình gửi email:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Có lỗi xảy ra khi gửi email xác nhận", 
        error: error instanceof Error ? error.message : "Unknown error",
        debug: "Exception caught in try-catch block"
      },
      { status: 500 }
    );
  }
} 