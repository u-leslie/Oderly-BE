import {z} from 'zod'

export const SignupSchema = z.object({
  username: z.string().min(4),
  email: z.string().email(),
  phone: z.string().min(11),
  password: z.string().min(4),
});

export const AddressSchema = z.object({
    street: z.string(),
    country : z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string().min(4),
})

export const UpdatedUserSchema = z.object({
    name: z.string().optional(),
    billingAddress: z.string().optional(),
    shippingAddress: z.string().optional(),
})