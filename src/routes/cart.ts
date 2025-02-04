import { Router } from "express";
import authMiddleware from "../middlewares/auth";
import { errorHandler } from "../error-handler";
import { addItemToCart, changeQuantity, getCart, removeItemFromCart } from "../controllers/cart";

const cartRoutes :Router =  Router();

cartRoutes.post ("/create",[authMiddleware],errorHandler(addItemToCart))
cartRoutes.get("/getCart", [authMiddleware],errorHandler(getCart))
cartRoutes.delete ("/delete/:id", [authMiddleware],errorHandler(removeItemFromCart))
cartRoutes.put ("/:id/change", [authMiddleware],errorHandler(changeQuantity));


export default cartRoutes;