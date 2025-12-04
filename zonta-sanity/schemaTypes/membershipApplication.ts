// zonta-sanity/schemaTypes/membershipApplication.ts

import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'membershipApplication',
  title: 'Membership Application',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
    }),
    defineField({
      name: 'membershipType',
      title: 'Membership Type',
      type: 'reference',
      to: [{type: 'membership'}],
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'status',
      title: 'Application Status',
      type: 'string',
      options: {
        list: [
          {title: 'Pending', value: 'pending'},
          {title: 'Approved', value: 'approved'},
          {title: 'Rejected', value: 'rejected'},
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'paid',
      title: 'Payment Status',
      type: 'boolean',
      initialValue: false,
      description: 'Whether the membership fee has been paid',
    }),
    defineField({
      name: 'paidAt',
      title: 'Paid At',
      type: 'datetime',
      description: 'When the payment was completed',
    }),
    defineField({
      name: 'stripeSessionId',
      title: 'Stripe Session ID',
      type: 'string',
      description: 'Stripe checkout session ID for this payment',
    }),
    defineField({
      name: 'paymentIntentId',
      title: 'Stripe Payment Intent ID',
      type: 'string',
      description: 'Stripe payment intent ID',
    }),
    defineField({
      name: 'createdAt',
      title: 'Submitted On',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
})
