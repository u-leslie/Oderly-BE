import { Router } from "express";
import { errorHandler } from "../error-handler";
import {
  cancelOrder,
  ChangeStatus,
  createOrder,
  getOrderById,
  getOrders,
  listAllOrders,
  listUserOrders,
} from "../controllers/order";
import authMiddleware from "../middlewares/auth";
import adminMiddleware from "../middlewares/admin";

const orderRoutes: Router = Router();

orderRoutes.post("/", [authMiddleware], errorHandler(createOrder));
orderRoutes.get("/orders", [authMiddleware], errorHandler(getOrders));
orderRoutes.get("/order/:id", [authMiddleware], errorHandler(getOrderById));
orderRoutes.delete("/cancel/:id", [authMiddleware], errorHandler(cancelOrder));
orderRoutes.get(
  "index",
  [authMiddleware, adminMiddleware],
  errorHandler(listAllOrders)
);

orderRoutes.get(
  "/status/:id",
  [authMiddleware, adminMiddleware],
  errorHandler(ChangeStatus)
);
orderRoutes.get(
  "/orderByUser/:id",
  [authMiddleware, adminMiddleware],
  errorHandler(listUserOrders)
);

export default orderRoutes;
