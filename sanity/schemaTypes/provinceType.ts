import { defineType, defineField } from 'sanity';

export const provinceType = defineType({
  name: 'province',
  title: 'Tỉnh / Thành phố',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Tên Tỉnh / Thành phố',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'code',
      title: 'Mã Tỉnh / Thành phố',
      type: 'string',
      description: 'Mã số hành chính của tỉnh/thành phố',
      validation: Rule => Rule.required()
    }),
  ],
});
