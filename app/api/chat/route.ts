import { NextResponse } from "next/server";
import { createClient } from "@sanity/client";
import { apiVersion, dataset, projectId } from "@/sanity/env";

const client = createClient({
  apiVersion,
  dataset,
  projectId,
  token: process.env.SANITY_API_WRITE_TOKEN, // Make sure to set this environment variable
});

export async function POST(request: Request) {
  try {
    const { sessionId, phoneNumber, author, text } = await request.json();

    if (!sessionId || !phoneNumber || !author || !text) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const doc = {
      _type: "chatMessage",
      sessionId,
      phoneNumber,
      author,
      text,
    };

    const result = await client.create(doc);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating chat message:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
