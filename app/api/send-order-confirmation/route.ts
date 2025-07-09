import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { renderOrderConfirmationEmail, OrderEmailData } from "@/lib/email-templates";

// Cấu hình transporter cho Nodemailer
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // Hoặc có thể thay đổi thành SMTP server khác
    auth: {
      user: process.env.EMAIL_USER, // Email gửi
      pass: process.env.EMAIL_PASSWORD, // Mật khẩu ứng dụng
    },
  });
};

// API endpoint gửi email xác nhận đơn hàng
export async function POST(request: NextRequest) {
  try {
    // Log debug cấu hình environment
    console.log("=== EMAIL API DEBUG ===");
    console.log("EMAIL_USER exists:", !!process.env.EMAIL_USER);
    console.log("EMAIL_PASSWORD exists:", !!process.env.EMAIL_PASSWORD);
    console.log("EMAIL_FROM:", process.env.EMAIL_FROM);
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

    // Kiểm tra cấu hình EMAIL
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error("EMAIL_USER hoặc EMAIL_PASSWORD không được cấu hình");
      return NextResponse.json(
        { 
          success: false, 
          message: "Cấu hình email chưa sẵn sàng",
          debug: "EMAIL_USER or EMAIL_PASSWORD not found in environment variables"
        },
        { status: 500 }
      );
    }

    // Tạo transporter
    const transporter = createTransporter();
    
    // Kiểm tra kết nối SMTP
    try {
      await transporter.verify();
      console.log("SMTP connection verified successfully");
    } catch (verifyError) {
      console.error("SMTP verification failed:", verifyError);
      return NextResponse.json(
        { 
          success: false, 
          message: "Không thể kết nối đến máy chủ email",
          debug: "SMTP verification failed"
        },
        { status: 500 }
      );
    }

    // Lấy email gửi từ environment hoặc sử dụng mặc định
    const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    console.log("Using from email:", fromEmail);

    // Tạo HTML content từ template
    console.log("Generating HTML content...");
    const htmlContent = renderOrderConfirmationEmail(emailData);
    console.log("HTML content length:", htmlContent.length);

    // Cấu hình email
    const mailOptions = {
      from: `"${emailData.storeName}" <${fromEmail}>`,
      to: emailData.customerEmail,
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
    };

    // Gửi email qua Nodemailer
    console.log("Sending email via Nodemailer...");
    const emailResponse = await transporter.sendMail(mailOptions);
    console.log("Nodemailer response:", emailResponse);

    // Kiểm tra kết quả gửi email
    if (!emailResponse.messageId) {
      console.error("Lỗi gửi email: Không có messageId trong response");
      return NextResponse.json(
        { 
          success: false, 
          message: "Không thể gửi email xác nhận", 
          debug: "Nodemailer did not return messageId"
        },
        { status: 500 }
      );
    }

    console.log("Email xác nhận đã được gửi thành công:", {
      messageId: emailResponse.messageId,
      to: emailData.customerEmail,
      orderNumber: emailData.orderNumber,
    });

    return NextResponse.json({
      success: true,
      message: "Email xác nhận đơn hàng đã được gửi thành công",
      data: {
        messageId: emailResponse.messageId,
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