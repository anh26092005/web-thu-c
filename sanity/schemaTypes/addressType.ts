import { HomeIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const addressType = defineType({
   name: "address",
  title: "Addresses",
  type: "document",
  icon: HomeIcon,
  fields: [
     defineField({
       name: "name",
       title: "Address Name",
       type: "string",
       description: "A friendly name for this address (e.g. Home, Work)",
       validation: (Rule) => Rule.required().max(50),
     }),
     defineField({
       name: "email",
       title: "User Email",
       type: "email",
     }),
     defineField({
       name: "streetAddress",
       title: "Số nhà, Tên đường / Ấp, Thôn, Xóm",
       type: "string",
       description: "Ví dụ: 123 Đường Nguyễn Huệ, hoặc Thôn A, Xã B",
       validation: (Rule) => Rule.required(),
     }),
     defineField({
       name: "province",
       title: "Tỉnh / Thành phố",
       type: "reference",
       to: [{ type: "province" }],
       validation: (Rule) => Rule.required(),
     }),
     defineField({
       name: "ward",
       title: "Phường / Xã",
       type: "reference",
       to: [{ type: "ward" }],
       validation: (Rule) => Rule.required(),
     }),
     defineField({
       name: "default",
       title: "Default Address",
       type: "boolean",
       description: "Is this the default shipping address?",
       initialValue: false,
     }),

     defineField({
       name: "createdAt",
       title: "Created At",
       type: "datetime",
       initialValue: () => new Date().toISOString(),
     }),
   ],
   preview: {
     select: {
       street: "streetAddress",
       provinceName: "province.name",
       wardName: "ward.name",
       isDefault: "default",
     },
     prepare(selection) {
       const { street, provinceName, wardName, isDefault } = selection;
       return {
         title: `${street || "Địa chỉ chưa đầy đủ"} ${isDefault ? "(Mặc định)" : ""}`,
         subtitle: `${wardName ? wardName + ", " : ""}${provinceName || ""}`,
       };
     },
   },
 });