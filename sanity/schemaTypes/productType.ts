import { TrolleyIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const productType = defineType({
  name: "product",
  title: "Products",
  type: "document",
  icon: TrolleyIcon,
  fields: [
    defineField({
      name: "name",
      title: "Tên sản phẩm",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "images",
      title: "Hình ảnh sản phẩm",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "description",
      title: "Mô tả",
      type: "string",
    }),
    defineField({
      name: "price",
      title: "Giá",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "discount",
      title: "Giảm giá",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "categories",
      title: "Danh mục",
      type: "array",
      of: [{ type: "reference", to: { type: "category" } }],
    }),
    defineField({
      name: "stock",
      title: "Số lượng",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "brand",
      title: "Nhà sản xuất",
      type: "reference",
      to: { type: "brand" },
    }),

    defineField({
      name: "origin",
      title: "Xuất xứ",
      type: "string",
    }),

    defineField({
      name: "status",
      title: "Product Status",
      type: "string",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Hot", value: "hot" },
          { title: "Sale", value: "sale" },
        ],
      },
    }),
    defineField({
      name: "variant",
      title: "Loại sản phẩm",
      type: "string",
      options: {
        list: [
          { title: "Thuốc", value: "thuoc" },
          { title: "Thực phẩm chức năng", value: "thuc-pham-chuc-nang" },
          { title: "Dược mỹ phẩm", value: "duoc-my-pham" },
          { title: "Chăm sóc cá nhân", value: "cham-soc-ca-nhan" },
          { title: "Trang thiết bị y tế", value: "trang-thiet-bi-y-te" },
          { title: "Dinh dưỡng", value: "dinh-duong-thuc-pham-chuc-nang" },
          { title: "Sinh lý", value: "sinh-ly" },
        ],
      },
    }),
    defineField({
      name: "isFeatured",
      title: "Sản phẩm nổi bật",
      type: "boolean",
      description: "Toggle to Featured on or off",
      initialValue: false,
    }),
    defineField({
      name: "drugInfo",
      title: "Thông tin Thuốc",
      type: "object",
      fields: [
        defineField({
          name: "drugName",
          title: "Tên Thuốc",
          type: "string",
          description: "Tên đầy đủ của thuốc, ví dụ: Thuốc mỡ bôi da Agiclovir 5%",
          validation: Rule => Rule.required(),
        }),
        defineField({
          name: "compositionSection",
          title: "Phần Thành phần",
          type: "object",
          fields: [
            defineField({
              name: "subtitle",
              title: "Tiêu đề phụ",
              type: "string",
              description: "Ví dụ: Thành phần cho 5g",
            }),
            defineField({
              name: "ingredientsTable",
              title: "Bảng Thành phần",
              type: "array",
              of: [
                defineField({
                  name: "ingredientRow",
                  title: "Hàng Thành phần",
                  type: "object",
                  fields: [
                    defineField({
                      name: "ingredientName",
                      title: "Thông tin thành phần",
                      type: "string",
                    }),
                    defineField({
                      name: "amount",
                      title: "Hàm lượng",
                      type: "string",
                    }),
                  ],
                  preview: {
                    select: {
                      title: "ingredientName",
                      subtitle: "amount",
                    },
                  },
                }),
              ],
            }),
          ],
        }),
        defineField({
          name: "usageSection",
          title: "Phần Công dụng",
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Tiêu đề chính của phần công dụng",
              type: "string",
              description: "Ví dụ: Công dụng của Thuốc mỡ bôi da Agiclovir 5%",
            }),
            defineField({
              name: "indications",
              title: "Chỉ định",
              type: "object",
              fields: [
                defineField({
                  name: "subtitle",
                  title: "Tiêu đề phụ",
                  type: "string",
                  description: "Ví dụ: Chỉ định",
                }),
                defineField({
                  name: "content",
                  title: "Nội dung Chỉ định",
                  type: "array",
                  of: [{ type: "block" }],
                }),
              ],
            }),
            defineField({
              name: "pharmacodynamics",
              title: "Dược lực học",
              type: "object",
              fields: [
                defineField({
                  name: "subtitle",
                  title: "Tiêu đề phụ",
                  type: "string",
                  description: "Ví dụ: Dược lực học",
                }),
                defineField({
                  name: "content",
                  title: "Nội dung Dược lực học",
                  type: "array",
                  of: [{ type: "block" }],
                }),
              ],
            }),
            defineField({
              name: "pharmacokinetics",
              title: "Dược động học",
              type: "object",
              fields: [
                defineField({
                  name: "subtitle",
                  title: "Tiêu đề phụ",
                  type: "string",
                  description: "Ví dụ: Dược động học",
                }),
                defineField({
                  name: "content",
                  title: "Nội dung Dược động học",
                  type: "array",
                  of: [{ type: "block" }],
                }),
              ],
            }),
          ],
        }),
        defineField({
          name: "usageInstructions",
          title: "Hướng dẫn Sử dụng",
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Tiêu đề chính của phần hướng dẫn sử dụng",
              type: "string",
              description: "Ví dụ: Cách dùng Thuốc mỡ bôi da Agiclovir 5%",
            }),
            defineField({
              name: "howToUse",
              title: "Cách dùng",
              type: "object",
              fields: [
                defineField({
                  name: "subtitle",
                  title: "Tiêu đề phụ",
                  type: "string",
                  description: "Ví dụ: Cách dùng",
                }),
                defineField({
                  name: "content",
                  title: "Nội dung Cách dùng",
                  type: "array",
                  of: [{ type: "block" }],
                }),
              ],
            }),
            defineField({
              name: "dosage",
              title: "Liều dùng",
              type: "object",
              fields: [
                defineField({
                  name: "subtitle",
                  title: "Tiêu đề phụ",
                  type: "string",
                  description: "Ví dụ: Liều dùng",
                }),
                defineField({
                  name: "content",
                  title: "Nội dung Liều dùng",
                  type: "array",
                  of: [{ type: "block" }],
                }),
              ],
            }),
          ],
        }),
        defineField({
          name: "overdoseAndMissedDose",
          title: "Xử lý Quá liều và Quên liều",
          type: "object",
          fields: [
            defineField({
              name: "overdose",
              title: "Khi dùng quá liều",
              type: "object",
              fields: [
                defineField({
                  name: "subtitle",
                  title: "Tiêu đề phụ",
                  type: "string",
                  description: "Ví dụ: Làm gì khi dùng quá liều?",
                }),
                defineField({
                  name: "content",
                  title: "Nội dung xử lý quá liều",
                  type: "array",
                  of: [{ type: "block" }],
                }),
              ],
            }),
            defineField({
              name: "missedDose",
              title: "Khi quên 1 liều",
              type: "object",
              fields: [
                defineField({
                  name: "subtitle",
                  title: "Tiêu đề phụ",
                  type: "string",
                  description: "Ví dụ: Làm gì khi quên 1 liều?",
                }),
                defineField({
                  name: "content",
                  title: "Nội dung xử lý quên liều",
                  type: "array",
                  of: [{ type: "block" }],
                }),
              ],
            }),
          ],
        }),
        defineField({
          name: "sideEffects",
          title: "Tác dụng phụ",
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Tiêu đề chính của phần tác dụng phụ",
              type: "string",
              description: "Ví dụ: Tác dụng phụ",
            }),
            defineField({
              name: "content",
              title: "Nội dung Tác dụng phụ",
              type: "array",
              of: [{ type: "block" }],
            }),
          ],
        }),
        defineField({
          name: 'warningsAndPrecautions',
          title: 'Cảnh báo và Thận trọng',
          type: 'object',
          fields: [
            defineField({
              name: 'mainNoteTitle',
              title: 'Tiêu đề chính',
              type: 'string',
              description: 'Tiêu đề chính cho phần cảnh báo và thận trọng (ví dụ: Lưu ý)',
            }),
            defineField({
              name: 'introText',
              title: 'Văn bản giới thiệu',
              type: 'array',
              of: [
                {
                  type: 'block',
                  styles: [{ title: 'Normal', value: 'normal' }],
                  marks: { decorators: [{ title: 'Strong', value: 'strong' }, { title: 'Emphasis', value: 'em' }] },
                },
              ],
            }),
            defineField({
              name: 'contraindications',
              title: 'Chống chỉ định',
              type: 'object',
              fields: [
                defineField({ name: 'subtitle', title: 'Tiêu đề phụ', type: 'string' }),
                defineField({
                  name: 'content',
                  title: 'Nội dung Chống chỉ định',
                  type: 'array',
                  of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [{ title: 'Strong', value: 'strong' }] } }],
                }),
              ],
            }),
            defineField({
              name: 'precautions',
              title: 'Thận trọng khi sử dụng',
              type: 'object',
              fields: [
                defineField({ name: 'subtitle', title: 'Tiêu đề phụ', type: 'string' }),
                defineField({
                  name: 'content',
                  title: 'Nội dung Thận trọng khi sử dụng',
                  type: 'array',
                  of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [{ title: 'Strong', value: 'strong' }] } }],
                }),
              ],
            }),
            defineField({
              name: 'drivingAndOperatingMachinery',
              title: 'Khả năng lái xe và vận hành máy móc',
              type: 'object',
              fields: [
                defineField({ name: 'subtitle', title: 'Tiêu đề phụ', type: 'string' }),
                defineField({
                  name: 'content',
                  title: 'Nội dung Khả năng lái xe và vận hành máy móc',
                  type: 'array',
                  of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [{ title: 'Strong', value: 'strong' }] } }],
                }),
              ],
            }),
            defineField({
              name: 'pregnancy',
              title: 'Thời kỳ mang thai',
              type: 'object',
              fields: [
                defineField({ name: 'subtitle', title: 'Tiêu đề phụ', type: 'string' }),
                defineField({
                  name: 'content',
                  title: 'Nội dung Thời kỳ mang thai',
                  type: 'array',
                  of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [{ title: 'Strong', value: 'strong' }] } }],
                }),
              ],
            }),
            defineField({
              name: 'breastfeeding',
              title: 'Thời kỳ cho con bú',
              type: 'object',
              fields: [
                defineField({ name: 'subtitle', title: 'Tiêu đề phụ', type: 'string' }),
                defineField({
                  name: 'content',
                  title: 'Nội dung Thời kỳ cho con bú',
                  type: 'array',
                  of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [{ title: 'Strong', value: 'strong' }] } }],
                }),
              ],
            }),
            defineField({
              name: 'drugInteractions',
              title: 'Tương tác thuốc',
              type: 'object',
              fields: [
                defineField({ name: 'subtitle', title: 'Tiêu đề phụ', type: 'string' }),
                defineField({
                  name: 'content',
                  title: 'Nội dung Tương tác thuốc',
                  type: 'array',
                  of: [{ type: 'block', styles: [{ title: 'Normal', value: 'normal' }], marks: { decorators: [{ title: 'Strong', value: 'strong' }] } }],
                }),
              ],
            }),
          ],
        }),
        defineField({
          name: 'storage',
          title: 'Bảo quản',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Tiêu đề chính của phần bảo quản',
              type: 'string',
              description: 'Ví dụ: Bảo quản',
            }),
            defineField({
              name: 'content',
              title: 'Nội dung Bảo quản',
              type: 'array',
              of: [
                {
                  type: 'block',
                  styles: [{ title: 'Normal', value: 'normal' }],
                  marks: { decorators: [{ title: 'Strong', value: 'strong' }, { title: 'Emphasis', value: 'em' }] },
                },
              ],
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "images",
      subtitle: "price",
    },
    prepare(selection) {
      const { title, subtitle, media } = selection;
      const image = media && media[0];
      return {
        title: title,
        subtitle: `$${subtitle}`,
        media: image,
      };
    },
  },
});
