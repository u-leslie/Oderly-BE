import {z} from 'zod'

export const SignupSchema = z.object({
  username: z.string().min(4),
  email: z.string().email(),
  phone: z.string().min(11),
  password: z.string().min(4),
});