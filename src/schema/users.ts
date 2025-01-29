import {z} from 'zod'

export const SignupSchema = z.object({
    email: z.string().email(),
    password: z.string().email(),
    username: z.string().min(4),
})