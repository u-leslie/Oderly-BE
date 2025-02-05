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

orderRoutes.post("/create", authMiddleware, errorHandler(createOrder));
orderRoutes.get("/getAll", authMiddleware, errorHandler(getOrders));
orderRoutes.get("/get/:id", authMiddleware, errorHandler(getOrderById));
orderRoutes.put("/cancel/:id", authMiddleware, errorHandler(cancelOrder));
orderRoutes.get(
  "/",
  authMiddleware, adminMiddleware,
  errorHandler(listAllOrders)
);

orderRoutes.put(
  "/status/:id",
  authMiddleware,
  adminMiddleware,
  errorHandler(ChangeStatus)
);
orderRoutes.get(
  "/orderByUser/:id",
  authMiddleware, adminMiddleware,
  errorHandler(listUserOrders)
);

export default orderRoutes;
