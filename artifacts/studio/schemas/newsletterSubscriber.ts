import { defineField, defineType } from "sanity";

export const newsletterSubscriber = defineType({
  name: "newsletterSubscriber",
  title: "Newsletter Subscriber",
  type: "document",
  fields: [
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (r) => r.required().email(),
    }),
    defineField({
      name: "newsletterSlug",
      title: "Newsletter slug",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "createdAt",
      title: "Created at",
      type: "datetime",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "source",
      title: "Source",
      type: "string",
      initialValue: "site",
    }),
  ],
  preview: {
    select: {
      title: "email",
      subtitle: "newsletterSlug",
    },
  },
});
