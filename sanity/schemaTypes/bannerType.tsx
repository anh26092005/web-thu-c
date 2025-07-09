import { defineField, defineType } from "sanity";

export const bannerType = defineType({
    name: 'banner',
    title: 'Banner',
    type: 'document',
    fields: [
      defineField({
        name: 'title',
        title: 'Tiêu đề Banner',
        type: 'string',
        description: 'Tiêu đề ngắn gọn cho banner (chỉ dùng cho quản lý nội bộ)',
        validation: Rule => Rule.required().min(1).max(100),
      }),
      defineField({
        name: 'image',
        title: 'Hình ảnh Banner',
        type: 'image',
        options: {
          hotspot: true, // Cho phép crop ảnh thông minh
          accept: 'image/*', // Chỉ chấp nhận file hình ảnh
        },
      }),
      defineField({
        name: 'alt',
            title: 'Văn bản thay thế (Alt Text)',
            type: 'string',
            description: 'Mô tả hình ảnh cho SEO và trợ năng',
            validation: Rule => Rule.required().min(1).max(200),
      }),
      defineField({
        name: 'description',
        title: 'Mô tả Banner',
        type: 'array', // Sử dụng Portable Text để mô tả có thể có định dạng
        of: [
          {
            type: 'block',
            styles: [
              { title: 'Normal', value: 'normal' },
              { title: 'H1', value: 'h1' },
              { title: 'H2', value: 'h2' },
              { title: 'H3', value: 'h3' },
            ],
            marks: {
              decorators: [
                { title: 'Strong', value: 'strong' },
                { title: 'Emphasis', value: 'em' },
              ],
              annotations: [
                {
                  name: 'link',
                  type: 'object',
                  title: 'URL',
                  fields: [
                    {
                      title: 'URL',
                      name: 'href',
                      type: 'url',
                    },
                  ],
                },
              ],
            },
          },
        ],
        description: 'Mô tả chi tiết cho banner, có thể chứa định dạng văn bản.',
      }),
      defineField({
        name: 'isActive', // Giữ lại để kiểm soát banner nào sẽ hiển thị
        title: 'Hoạt động',
        type: 'boolean',
        description: 'Đặt thành "true" để hiển thị banner này trên trang web.',
        initialValue: true,
      }),
      defineField({
        name: 'isPopup',
        title: 'Hiển thị làm Popup',
        type: 'boolean',
        description: 'Đặt thành "true" để hiển thị banner này làm popup khuyến mãi khi vào trang web.',
        initialValue: false,
      }),
      defineField({
        name: 'popupFrequency',
        title: 'Tần suất hiển thị Popup',
        type: 'string',
        options: {
          list: [
            { title: 'Mỗi lần truy cập', value: 'always' },
            { title: 'Một lần mỗi ngày', value: 'daily' },
            { title: 'Một lần mỗi tuần', value: 'weekly' },
            { title: 'Chỉ một lần', value: 'once' },
          ],
        },
        description: 'Chọn tần suất hiển thị popup.',
        initialValue: 'daily',
        hidden: ({ parent }) => !parent?.isPopup, // Chỉ hiện khi isPopup = true
      }),
    ],
    preview: {
      select: {
        title: 'title',
        media: 'image',
        isPopup: 'isPopup',
      },
      prepare({ title, media, isPopup }) {
        return {
          title: title || 'Banner mới',
          subtitle: isPopup ? 'Popup Banner' : 'Banner thường',
          media,
        };
      },
    },
  });