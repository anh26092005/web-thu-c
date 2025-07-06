import { defineField, defineType } from "sanity";

export default defineType({
  name: "chatMessage",
  title: "Chat Message",
  type: "document",
  fields: [
    defineField({
      name: "sessionId",
      title: "Session ID",
      type: "string",
    }),
    defineField({
      name: "phoneNumber",
      title: "Phone Number",
      type: "string",
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string", // 'user' or 'agent'
    }),
    defineField({
      name: "text",
      title: "Text",
      type: "text",
    }),
  ],
  preview: {
    select: {
      sessionId: "sessionId",
      author: "author",
      text: "text",
    },
    prepare(selection) {
      const { sessionId, author, text } = selection;
      return { title: `[${sessionId}] ${author}: ${text.substring(0, 20)}...` };
    },
  },
});
