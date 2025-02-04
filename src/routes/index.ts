import { Router } from "express";
import authRoutes from "./auth";
import productRoutes from "./product";
import userRoutes from "./user";
import cartRoutes from "./cart";
import orderRoutes from "./order";
const rootRouter:Router = Router();


rootRouter.use('/auth',authRoutes)
rootRouter.use('/products', productRoutes)
rootRouter.use("/orders",orderRoutes)
rootRouter.use('/user', userRoutes)
rootRouter.use('/cart', cartRoutes)
export default rootRouter;