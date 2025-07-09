import { OrderEmailData } from "./email-templates";

// Interface cho dữ liệu đơn hàng từ database
export interface OrderData {
  orderNumber: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  products: Array<{
    name: string;
    quantity: number;
    price: number;
    discount?: number; // Thêm trường discount cho sản phẩm
  }>;
  totalPrice: number;
  originalPrice: number;
  discountAmount: number;
  shippingDiscount: number;
  paymentMethod: string;
  shippingAddress: {
    street: string;
    ward: string;
    province: string;
  };
  orderDate: string;
  estimatedDeliveryDate: string;
}

// Cấu hình thông tin cửa hàng
export const STORE_CONFIG = {
  name: "Nhà Thuốc Khủng Long Châu",
  supportPhone: "0909090909",
  supportEmail: "support@nhathuockhunglongchau.com",
  feedbackLink: "https://nhathuockhunglongchau.com/feedback",
};

// Hàm chuyển đổi dữ liệu đơn hàng thành format email
export const prepareOrderEmailData = (orderData: OrderData): OrderEmailData => {
  // Tính số ngày giao hàng dự kiến
  const orderDate = new Date(orderData.orderDate);
  const estimatedDate = new Date(orderData.estimatedDeliveryDate);
  const estimatedDeliveryDays = Math.ceil(
    (estimatedDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Tính phí vận chuyển (miễn phí nếu có giảm giá vận chuyển)
  const shippingFee = orderData.shippingDiscount > 0 ? 0 : 30000;

  // Function tính giá sau khi giảm
  const getDiscountedPrice = (price: number, discount: number = 0) => {
    if (discount > 0) {
      return price - (discount * price) / 100;
    }
    return price;
  };

  return {
    orderNumber: orderData.orderNumber,
    customerName: orderData.customerInfo.name,
    customerEmail: orderData.customerInfo.email,
    customerPhone: orderData.customerInfo.phone,
    orderDate: formatDate(orderData.orderDate),
    status: "pending", // Trạng thái mặc định cho đơn hàng mới
    products: orderData.products.map(product => {
      const discountedPrice = getDiscountedPrice(product.price, product.discount);
      return {
        name: product.name,
        quantity: product.quantity,
        price: product.price, // Giá gốc
        discount: product.discount || 0, // Phần trăm giảm giá
        discountedPrice: discountedPrice, // Giá sau khi giảm
        totalPrice: product.price * product.quantity, // Tổng tiền gốc (price * quantity)
        totalDiscountedPrice: discountedPrice * product.quantity, // Tổng tiền sau giảm
      };
    }),
    subtotal: orderData.originalPrice, // Tổng giá gốc của tất cả sản phẩm
    discountAmount: orderData.discountAmount, // Tổng số tiền giảm từ mã giảm giá
    shippingFee: shippingFee,
    totalAmount: orderData.totalPrice, // Tổng tiền cuối cùng
    paymentMethod: orderData.paymentMethod,
    shippingAddress: orderData.shippingAddress,
    estimatedDeliveryDays: estimatedDeliveryDays,
    storeName: STORE_CONFIG.name,
    supportPhone: STORE_CONFIG.supportPhone,
    supportEmail: STORE_CONFIG.supportEmail,
    feedbackLink: STORE_CONFIG.feedbackLink,
  };
};

// Hàm format ngày tháng theo định dạng Việt Nam
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Hàm gửi email xác nhận đơn hàng
export const sendOrderConfirmationEmail = async (orderData: OrderData): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> => {
  try {
    // Chuẩn bị dữ liệu email
    const emailData = prepareOrderEmailData(orderData);

    // Tạo URL API với fallback
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    const apiUrl = `${baseUrl}/api/send-order-confirmation`;
    
    console.log("Đang gọi API email tại:", apiUrl);

    // Gọi API gửi email
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    // Kiểm tra content-type để đảm bảo response là JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text();
      console.error("Response không phải JSON:", responseText);
      return {
        success: false,
        message: "API trả về response không hợp lệ",
        error: `Expected JSON but got: ${contentType}`,
      };
    }

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || "Không thể gửi email xác nhận",
        error: result.error,
      };
    }

    return {
      success: true,
      message: "Email xác nhận đã được gửi thành công",
    };

  } catch (error) {
    console.error("Lỗi gửi email xác nhận:", error);
    return {
      success: false,
      message: "Có lỗi xảy ra khi gửi email xác nhận",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Hàm gửi email thông báo trạng thái đơn hàng
export const sendOrderStatusEmail = async (
  orderData: OrderData,
  newStatus: string,
  trackingNumber?: string
): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> => {
  try {
    // Chuẩn bị dữ liệu email với trạng thái mới
    const emailData = prepareOrderEmailData(orderData);
    emailData.status = newStatus;

    // Cập nhật subject và nội dung tùy theo trạng thái
    let subject = "";
    let statusMessage = "";

    switch (newStatus) {
      case "processing":
        subject = `Đơn hàng #${orderData.orderNumber} đang được xử lý`;
        statusMessage = "Đơn hàng của bạn đang được chuẩn bị";
        break;
      case "shipped":
        subject = `Đơn hàng #${orderData.orderNumber} đã được giao cho đơn vị vận chuyển`;
        statusMessage = trackingNumber 
          ? `Đơn hàng đã được giao cho đơn vị vận chuyển. Mã vận đơn: ${trackingNumber}`
          : "Đơn hàng đã được giao cho đơn vị vận chuyển";
        break;
      case "delivered":
        subject = `Đơn hàng #${orderData.orderNumber} đã được giao thành công`;
        statusMessage = "Đơn hàng đã được giao thành công. Cảm ơn bạn đã mua sắm!";
        break;
      case "cancelled":
        subject = `Đơn hàng #${orderData.orderNumber} đã bị hủy`;
        statusMessage = "Đơn hàng đã bị hủy. Nếu có thắc mắc, vui lòng liên hệ bộ phận hỗ trợ.";
        break;
      default:
        subject = `Cập nhật trạng thái đơn hàng #${orderData.orderNumber}`;
        statusMessage = "Trạng thái đơn hàng đã được cập nhật";
    }

    // Gọi API gửi email (có thể tạo endpoint riêng cho status update)
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-order-confirmation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...emailData,
        customSubject: subject,
        customMessage: statusMessage,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.message || "Không thể gửi email thông báo",
        error: result.error,
      };
    }

    return {
      success: true,
      message: "Email thông báo trạng thái đã được gửi thành công",
    };

  } catch (error) {
    console.error("Lỗi gửi email thông báo trạng thái:", error);
    return {
      success: false,
      message: "Có lỗi xảy ra khi gửi email thông báo",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}; 