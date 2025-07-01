import { defineType } from "sanity";

export const bannerType = defineType({
    name: 'banner',
    title: 'Banner',
    type: 'document',
    fields: [
      {
        name: 'title',
        title: 'Tiêu đề Banner',
        type: 'string',
        description: 'Tiêu đề ngắn gọn cho banner (chỉ dùng cho quản lý nội bộ)',
      },
      {
        name: 'image',
        title: 'Hình ảnh Banner',
        type: 'image',
        options: {
          hotspot: true, // Cho phép crop ảnh thông minh
        },
        fields: [
          {
            name: 'alt',
            title: 'Văn bản thay thế (Alt Text)',
            type: 'string',
            description: 'Mô tả hình ảnh cho SEO và trợ năng',
            validation: Rule => Rule.required(),
          },
        ],
        validation: Rule => Rule.required(),
      },
      {
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
      },
      {
        name: 'isActive', // Giữ lại để kiểm soát banner nào sẽ hiển thị
        title: 'Hoạt động',
        type: 'boolean',
        description: 'Đặt thành "true" để hiển thị banner này trên trang web.',
        initialValue: true,
      },
    ],
    preview: {
      select: {
        title: 'title',
        media: 'image',
      },
      prepare({ title, media }) {
        return {
          title: title || 'Banner mới',
          subtitle: 'Banner',
          media,
        };
      },
    },
  });