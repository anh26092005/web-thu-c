import { defineType, defineField } from 'sanity';

export const vietnameseAddressType = defineType({
  name: 'vietnameseAddress',
  title: 'Địa chỉ Việt Nam',
  type: 'object',
  fields: [
    defineField({
      name: 'streetAddress',
      title: 'Số nhà, Tên đường / Ấp, Thôn, Xóm',
      type: 'string',
      description: 'Ví dụ: 123 Đường Nguyễn Huệ, hoặc Thôn A, Xã B',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'province',
      title: 'Tỉnh / Thành phố',
      type: 'reference',
      to: [{ type: 'province' }],
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'ward',
      title: 'Phường / Xã',
      type: 'reference',
      to: [{ type: 'ward' }],
      validation: Rule => Rule.required(),
    }),
  ],
  preview: {
    select: {
      street: 'streetAddress',
      provinceName: 'province.name',
      wardName: 'ward.name',
    },
    prepare(selection) {
      const { street, provinceName, wardName } = selection;
      return {
        title: street || 'Địa chỉ chưa đầy đủ',
        subtitle: `${wardName ? wardName + ', ' : ''}${provinceName || ''}`,
      };
    },
  },
});
