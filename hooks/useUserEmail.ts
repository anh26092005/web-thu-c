import { useUser } from "@clerk/nextjs";

// Custom hook để trích xuất email từ Clerk user
export const useUserEmail = () => {
  const { user } = useUser();

  const extractUserEmail = (): { email: string; source: string } => {
    if (!user) {
      return { email: "", source: "no_user" };
    }

    console.log("=== BẮT ĐẦU TRÍCH XUẤT EMAIL ===");
    console.log("User object:", user);
    
    // Ưu tiên 1: Primary email address (đã verify)
    if (user?.primaryEmailAddress?.emailAddress) {
      console.log("✅ Tìm thấy primary email:", user.primaryEmailAddress.emailAddress);
      console.log("Primary email verification:", user.primaryEmailAddress.verification);
      return { 
        email: user.primaryEmailAddress.emailAddress, 
        source: "primary_email" 
      };
    }
    
    // Ưu tiên 2: Email đầu tiên trong mảng emailAddresses
    if (user?.emailAddresses && Array.isArray(user.emailAddresses) && user.emailAddresses.length > 0) {
      console.log("📧 Danh sách email addresses:", user.emailAddresses);
      for (let i = 0; i < user.emailAddresses.length; i++) {
        const emailObj = user.emailAddresses[i];
        console.log(`Email ${i + 1}:`, emailObj);
        if (emailObj?.emailAddress) {
          console.log("✅ Sử dụng email từ danh sách:", emailObj.emailAddress);
          return { 
            email: emailObj.emailAddress, 
            source: "email_addresses_array" 
          };
        }
      }
    }
    
    // Ưu tiên 3: Kiểm tra các thuộc tính khác của user
    const possibleEmailFields = ['email', 'emailAddress', 'primaryEmail'];
    for (const field of possibleEmailFields) {
      if (user?.[field as keyof typeof user] && typeof user[field as keyof typeof user] === 'string') {
        const email = user[field as keyof typeof user] as string;
        console.log(`✅ Tìm thấy email trong ${field}:`, email);
        return { 
          email, 
          source: `user_${field}` 
        };
      }
    }
    
    console.log("❌ KHÔNG TÌM THẤY EMAIL HỢP LỆ");
    console.log("=== KẾT THÚC TRÍCH XUẤT EMAIL ===");
    return { email: "", source: "not_found" };
  };

  return {
    extractUserEmail,
    user
  };
}; 