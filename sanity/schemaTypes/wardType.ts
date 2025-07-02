import { defineType, defineField } from 'sanity';

export const wardType = defineType({
  name: 'ward',
  title: 'Phường / Xã',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Tên Phường / Xã',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'code',
      title: 'Mã Phường / Xã',
      type: 'string',
      description: 'Mã số hành chính của phường/xã',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'province',
      title: 'Thuộc Tỉnh / Thành phố',
      type: 'reference',
      to: [{ type: 'province' }],
      validation: Rule => Rule.required(),
    }),
  ],
});
