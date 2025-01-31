import { Router } from "express";
import { errorHandler } from "../error-handler";
import { cancelOrder, createOrder, getOrderById, getOrders } from "../controllers/order";
import authMiddleware from "../middlewares/auth";

const orderRoutes:Router = Router();

orderRoutes.post('/',[authMiddleware],errorHandler(createOrder))
orderRoutes.get('/orders', [authMiddleware],errorHandler(getOrders))
orderRoutes.get('/order/:id', [authMiddleware],errorHandler(getOrderById))
orderRoutes.delete('/cancel/:id', [authMiddleware],errorHandler(cancelOrder))

export default orderRoutes;