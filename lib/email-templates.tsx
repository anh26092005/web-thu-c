import React from 'react';

// Interface cho dữ liệu đơn hàng
export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderDate: string;
  status: string;
  products: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: {
    street: string;
    ward: string;
    province: string;
  };
  estimatedDeliveryDays: number;
  storeName: string;
  supportPhone: string;
  supportEmail: string;
  feedbackLink?: string;
}

// Template email xác nhận đơn hàng
export const OrderConfirmationTemplate = ({
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  orderDate,
  status,
  products,
  subtotal,
  discountAmount,
  shippingFee,
  totalAmount,
  paymentMethod,
  shippingAddress,
  estimatedDeliveryDays,
  storeName,
  supportPhone,
  supportEmail,
  feedbackLink,
}: OrderEmailData) => {
  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      lineHeight: '1.6', 
      color: '#333',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center' as const,
        marginBottom: '30px'
      }}>
        <h1 style={{
          color: '#2c5aa0',
          fontSize: '24px',
          margin: '0 0 10px 0'
        }}>
          Xác nhận đơn hàng #{orderNumber}
        </h1>
        <p style={{ margin: '0', fontSize: '16px', color: '#666' }}>
          từ {storeName}
        </p>
      </div>

      {/* Greeting */}
      <div style={{ marginBottom: '30px' }}>
        <p>Chào <strong>{customerName}</strong>,</p>
        <p>
          Cảm ơn bạn đã tin tưởng và mua sắm tại <strong>{storeName}</strong>! 
          Chúng tôi đã nhận được đơn hàng của bạn và đang tiến hành xử lý.
        </p>
        <p>Dưới đây là thông tin chi tiết về đơn hàng của bạn:</p>
      </div>

      {/* Order Information */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h2 style={{
          color: '#2c5aa0',
          fontSize: '18px',
          marginBottom: '15px',
          borderBottom: '2px solid #2c5aa0',
          paddingBottom: '5px'
        }}>
          THÔNG TIN ĐƠN HÀNG
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
          <tr>
            <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Mã đơn hàng:</td>
            <td style={{ padding: '8px 0' }}>{orderNumber}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Ngày đặt hàng:</td>
            <td style={{ padding: '8px 0' }}>{orderDate}</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Trạng thái:</td>
            <td style={{ padding: '8px 0' }}>
              <span style={{
                backgroundColor: status === 'pending' ? '#ffc107' : '#28a745',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                {status === 'pending' ? 'Đang xử lý' : 
                 status === 'processing' ? 'Đang xử lý' : 
                 status === 'shipped' ? 'Đã giao vận' : 'Đã hoàn thành'}
              </span>
            </td>
          </tr>
        </table>
      </div>

      {/* Product Details */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h2 style={{
          color: '#2c5aa0',
          fontSize: '18px',
          marginBottom: '15px',
          borderBottom: '2px solid #2c5aa0',
          paddingBottom: '5px'
        }}>
          CHI TIẾT SẢN PHẨM
        </h2>
        {products.map((product, index) => (
          <div key={index} style={{
            borderBottom: index < products.length - 1 ? '1px solid #ddd' : 'none',
            paddingBottom: '15px',
            marginBottom: '15px'
          }}>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '16px',
              color: '#333'
            }}>
              {product.name}
            </h3>
            <p style={{ margin: '0', color: '#666' }}>
              Số lượng: <strong>{product.quantity}</strong>
            </p>
            <p style={{ margin: '0', color: '#666' }}>
              Giá: <strong>{product.price.toLocaleString()}đ</strong>
            </p>
          </div>
        ))}
      </div>

      {/* Payment Summary */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h2 style={{
          color: '#2c5aa0',
          fontSize: '18px',
          marginBottom: '15px',
          borderBottom: '2px solid #2c5aa0',
          paddingBottom: '5px'
        }}>
          TÓM TẮT THANH TOÁN
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
          <tr>
            <td style={{ padding: '8px 0' }}>Tạm tính:</td>
            <td style={{ padding: '8px 0', textAlign: 'right' as const }}>
              {subtotal.toLocaleString()}đ
            </td>
          </tr>
          {discountAmount > 0 && (
            <tr>
              <td style={{ padding: '8px 0', color: '#28a745' }}>Giảm giá:</td>
              <td style={{ padding: '8px 0', textAlign: 'right' as const, color: '#28a745' }}>
                -{discountAmount.toLocaleString()}đ
              </td>
            </tr>
          )}
          <tr>
            <td style={{ padding: '8px 0' }}>Phí vận chuyển:</td>
            <td style={{ padding: '8px 0', textAlign: 'right' as const }}>
              {shippingFee > 0 ? `${shippingFee.toLocaleString()}đ` : 'Miễn phí'}
            </td>
          </tr>
          <tr style={{ borderTop: '2px solid #2c5aa0' }}>
            <td style={{ padding: '12px 0', fontWeight: 'bold', fontSize: '18px' }}>
              TỔNG CỘNG:
            </td>
            <td style={{ 
              padding: '12px 0', 
              textAlign: 'right' as const, 
              fontWeight: 'bold', 
              fontSize: '18px',
              color: '#2c5aa0'
            }}>
              {totalAmount.toLocaleString()}đ
            </td>
          </tr>
        </table>
        <p style={{ margin: '15px 0 0 0', color: '#666' }}>
          Phương thức thanh toán: <strong>
            {paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 
             paymentMethod === 'vnpay' ? 'Thanh toán qua VNPAY' : paymentMethod}
          </strong>
        </p>
      </div>

      {/* Shipping Address */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h2 style={{
          color: '#2c5aa0',
          fontSize: '18px',
          marginBottom: '15px',
          borderBottom: '2px solid #2c5aa0',
          paddingBottom: '5px'
        }}>
          ĐỊA CHỈ GIAO HÀNG
        </h2>
        <p style={{ margin: '0 0 8px 0' }}>
          <strong>Người nhận:</strong> {customerName}
        </p>
        <p style={{ margin: '0 0 8px 0' }}>
          <strong>Địa chỉ:</strong> {shippingAddress.street}, {shippingAddress.ward}, {shippingAddress.province}
        </p>
        <p style={{ margin: '0' }}>
          <strong>Số điện thoại:</strong> {customerPhone}
        </p>
      </div>

      {/* Delivery Information */}
      <div style={{
        backgroundColor: '#e7f3ff',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px',
        border: '1px solid #2c5aa0'
      }}>
        <p style={{ margin: '0', color: '#2c5aa0', fontWeight: 'bold' }}>
          📦 Thông tin giao hàng
        </p>
        <p style={{ margin: '10px 0 0 0' }}>
          Chúng tôi sẽ gửi một email thông báo nữa ngay khi đơn hàng của bạn được bàn giao cho đơn vị vận chuyển. 
          Thời gian giao hàng dự kiến là <strong>{estimatedDeliveryDays} ngày</strong>.
        </p>
      </div>

      {/* Support Section */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h2 style={{
          color: '#2c5aa0',
          fontSize: '18px',
          marginBottom: '15px',
          borderBottom: '2px solid #2c5aa0',
          paddingBottom: '5px'
        }}>
          HỖ TRỢ, KHIẾU NẠI VÀ ĐÓNG GÓP Ý KIẾN
        </h2>
        <p>Sự hài lòng của bạn là ưu tiên hàng đầu của chúng tôi.</p>
        <p>
          Nếu có bất kỳ câu hỏi hay thắc mắc nào về đơn hàng, bạn chỉ cần trả lời lại email này hoặc 
          gọi đến hotline <strong>{supportPhone}</strong> của chúng tôi.
        </p>
        <p>
          Trong trường hợp cần khiếu nại về sản phẩm hoặc dịch vụ, xin đừng ngần ngại liên hệ với 
          bộ phận Chăm sóc khách hàng qua email <strong>{supportEmail}</strong> để được giải quyết nhanh chóng nhất. 
          Vui lòng đính kèm mã đơn hàng <strong>#{orderNumber}</strong> để chúng tôi có thể hỗ trợ bạn tốt hơn.
        </p>
        {feedbackLink && (
          <p>
            Mọi ý kiến đóng góp để giúp {storeName} cải thiện dịch vụ đều vô cùng quý giá. 
            Chúng tôi rất mong nhận được phản hồi của bạn tại{' '}
            <a href={feedbackLink} style={{ color: '#2c5aa0', textDecoration: 'underline' }}>
              đây
            </a>.
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center' as const,
        padding: '20px',
        borderTop: '1px solid #ddd',
        marginTop: '30px'
      }}>
        <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#2c5aa0' }}>
          Một lần nữa, {storeName} xin chân thành cảm ơn bạn!
        </p>
        <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#666' }}>
          Email này được gửi tự động, vui lòng không trả lời trực tiếp.
        </p>
      </div>
    </div>
  );
};

// Hàm render template thành HTML string
export const renderOrderConfirmationEmail = (data: OrderEmailData): string => {
  // Tạo HTML string từ template
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Xác nhận đơn hàng #${data.orderNumber}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c5aa0; font-size: 24px; margin: 0 0 10px 0;">
            Xác nhận đơn hàng #${data.orderNumber}
          </h1>
          <p style="margin: 0; font-size: 16px; color: #666;">
            từ ${data.storeName}
          </p>
        </div>

        <!-- Greeting -->
        <div style="margin-bottom: 30px;">
          <p>Chào <strong>${data.customerName}</strong>,</p>
          <p>
            Cảm ơn bạn đã tin tưởng và mua sắm tại <strong>${data.storeName}</strong>! 
            Chúng tôi đã nhận được đơn hàng của bạn và đang tiến hành xử lý.
          </p>
          <p>Dưới đây là thông tin chi tiết về đơn hàng của bạn:</p>
        </div>

        <!-- Order Information -->
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #2c5aa0; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #2c5aa0; padding-bottom: 5px;">
            THÔNG TIN ĐƠN HÀNG
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Mã đơn hàng:</td>
              <td style="padding: 8px 0;">${data.orderNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Ngày đặt hàng:</td>
              <td style="padding: 8px 0;">${data.orderDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Trạng thái:</td>
              <td style="padding: 8px 0;">
                <span style="background-color: ${data.status === 'pending' ? '#ffc107' : '#28a745'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                  ${data.status === 'pending' ? 'Đang xử lý' : 
                    data.status === 'processing' ? 'Đang xử lý' : 
                    data.status === 'shipped' ? 'Đã giao vận' : 'Đã hoàn thành'}
                </span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Product Details -->
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #2c5aa0; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #2c5aa0; padding-bottom: 5px;">
            CHI TIẾT SẢN PHẨM
          </h2>
          ${data.products.map((product, index) => `
            <div style="border-bottom: ${index < data.products.length - 1 ? '1px solid #ddd' : 'none'}; padding-bottom: 15px; margin-bottom: 15px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">
                ${product.name}
              </h3>
              <p style="margin: 0; color: #666;">
                Số lượng: <strong>${product.quantity}</strong>
              </p>
              <p style="margin: 0; color: #666;">
                Giá: <strong>${product.price.toLocaleString()}đ</strong>
              </p>
            </div>
          `).join('')}
        </div>

        <!-- Payment Summary -->
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #2c5aa0; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #2c5aa0; padding-bottom: 5px;">
            TÓM TẮT THANH TOÁN
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0;">Tạm tính:</td>
              <td style="padding: 8px 0; text-align: right;">
                ${data.subtotal.toLocaleString()}đ
              </td>
            </tr>
            ${data.discountAmount > 0 ? `
            <tr>
              <td style="padding: 8px 0; color: #28a745;">Giảm giá:</td>
              <td style="padding: 8px 0; text-align: right; color: #28a745;">
                -${data.discountAmount.toLocaleString()}đ
              </td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0;">Phí vận chuyển:</td>
              <td style="padding: 8px 0; text-align: right;">
                ${data.shippingFee > 0 ? `${data.shippingFee.toLocaleString()}đ` : 'Miễn phí'}
              </td>
            </tr>
            <tr style="border-top: 2px solid #2c5aa0;">
              <td style="padding: 12px 0; font-weight: bold; font-size: 18px;">
                TỔNG CỘNG:
              </td>
              <td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 18px; color: #2c5aa0;">
                ${data.totalAmount.toLocaleString()}đ
              </td>
            </tr>
          </table>
          <p style="margin: 15px 0 0 0; color: #666;">
            Phương thức thanh toán: <strong>
              ${data.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 
                data.paymentMethod === 'vnpay' ? 'Thanh toán qua VNPAY' : data.paymentMethod}
            </strong>
          </p>
        </div>

        <!-- Shipping Address -->
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #2c5aa0; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #2c5aa0; padding-bottom: 5px;">
            ĐỊA CHỈ GIAO HÀNG
          </h2>
          <p style="margin: 0 0 8px 0;">
            <strong>Người nhận:</strong> ${data.customerName}
          </p>
          <p style="margin: 0 0 8px 0;">
            <strong>Địa chỉ:</strong> ${data.shippingAddress.street}, ${data.shippingAddress.ward}, ${data.shippingAddress.province}
          </p>
          <p style="margin: 0;">
            <strong>Số điện thoại:</strong> ${data.customerPhone}
          </p>
        </div>

        <!-- Delivery Information -->
        <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #2c5aa0;">
          <p style="margin: 0; color: #2c5aa0; font-weight: bold;">
            📦 Thông tin giao hàng
          </p>
          <p style="margin: 10px 0 0 0;">
            Chúng tôi sẽ gửi một email thông báo nữa ngay khi đơn hàng của bạn được bàn giao cho đơn vị vận chuyển. 
            Thời gian giao hàng dự kiến là <strong>${data.estimatedDeliveryDays} ngày</strong>.
          </p>
        </div>

        <!-- Support Section -->
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #2c5aa0; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #2c5aa0; padding-bottom: 5px;">
            HỖ TRỢ, KHIẾU NẠI VÀ ĐÓNG GÓP Ý KIẾN
          </h2>
          <p>Sự hài lòng của bạn là ưu tiên hàng đầu của chúng tôi.</p>
          <p>
            Nếu có bất kỳ câu hỏi hay thắc mắc nào về đơn hàng, bạn chỉ cần trả lời lại email này hoặc 
            gọi đến hotline <strong>${data.supportPhone}</strong> của chúng tôi.
          </p>
          <p>
            Trong trường hợp cần khiếu nại về sản phẩm hoặc dịch vụ, xin đừng ngần ngại liên hệ với 
            bộ phận Chăm sóc khách hàng qua email <strong>${data.supportEmail}</strong> để được giải quyết nhanh chóng nhất. 
            Vui lòng đính kèm mã đơn hàng <strong>#${data.orderNumber}</strong> để chúng tôi có thể hỗ trợ bạn tốt hơn.
          </p>
          ${data.feedbackLink ? `
          <p>
            Mọi ý kiến đóng góp để giúp ${data.storeName} cải thiện dịch vụ đều vô cùng quý giá. 
            Chúng tôi rất mong nhận được phản hồi của bạn tại 
            <a href="${data.feedbackLink}" style="color: #2c5aa0; text-decoration: underline;">đây</a>.
          </p>
          ` : ''}
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 20px; border-top: 1px solid #ddd; margin-top: 30px;">
          <p style="margin: 0; font-size: 18px; font-weight: bold; color: #2c5aa0;">
            Một lần nữa, ${data.storeName} xin chân thành cảm ơn bạn!
          </p>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
            Email này được gửi tự động, vui lòng không trả lời trực tiếp.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
}; 