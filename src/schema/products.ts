import {z} from 'zod'

export const ProductSchema = z.object({
  name: z.string().min(4),
  description: z.string().min(4),
  price: z.number().positive(),
  tags: z.array(z.string())
});