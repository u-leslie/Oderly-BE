import { Router } from "express";
import { errorHandler } from "../error-handler";
import { createProduct, deleteProduct, getProductById, getProducts, searchProduct, updateProduct } from "../controllers/products";
import authMiddleware from "../middlewares/auth";
import adminMiddleware from "../middlewares/admin";

const productRoutes: Router = Router();

productRoutes.post("/create",authMiddleware,adminMiddleware, errorHandler(createProduct));
productRoutes.get("/get" , authMiddleware,adminMiddleware, errorHandler(getProducts));
productRoutes.get("/get/:id", authMiddleware,adminMiddleware, errorHandler(getProductById));
productRoutes.put("/update/:id", authMiddleware,adminMiddleware, errorHandler(updateProduct));
productRoutes.get("/search", authMiddleware, errorHandler(searchProduct))
productRoutes.delete("/delete/:id", authMiddleware,adminMiddleware, errorHandler(deleteProduct));

export default productRoutes;
