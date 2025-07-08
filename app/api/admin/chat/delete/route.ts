import { NextRequest, NextResponse } from "next/server";
import { backendClient } from "@/sanity/lib/backendClient";

export async function DELETE(request: NextRequest) {
  try {
    const { messageId, sessionId } = await request.json();

    if (!messageId && !sessionId) {
      return NextResponse.json(
        { success: false, error: "Vui lòng cung cấp messageId hoặc sessionId để xóa." },
        { status: 400 }
      );
    }

    let result;
    if (messageId) {
      // Xóa một tin nhắn cụ thể
      result = await backendClient.delete(messageId);
    } else if (sessionId) {
      // Xóa tất cả tin nhắn trong một phiên chat
      const query = `*[_type == "chatMessage" && sessionId == $sessionId]._id`;
      const messageIdsToDelete = await backendClient.fetch(query, { sessionId });
      
      if (messageIdsToDelete.length > 0) {
        result = await backendClient.delete({
          query: `*[_type == "chatMessage" && sessionId == $sessionId]`,
          params: { sessionId },
        });
      } else {
        return NextResponse.json({ success: true, message: "Không tìm thấy tin nhắn nào để xóa trong phiên này." });
      }
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Lỗi khi xóa tin nhắn chat:", error);
    return NextResponse.json(
      { success: false, error: "Không thể xóa tin nhắn chat." },
      { status: 500 }
    );
  }
}
