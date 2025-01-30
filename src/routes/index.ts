import { Router } from "express";
import authRoutes from "./auth";
import productRoutes from "./product";
import userRoutes from "./user";
const rootRouter:Router = Router();

rootRouter.use('/auth',authRoutes)
rootRouter.use('/products', productRoutes)
rootRouter.use('/user', userRoutes)
export default rootRouter;