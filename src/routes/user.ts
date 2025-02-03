import { Router } from "express";
import authMiddleware from "../middlewares/auth";
import adminMiddleware from "../middlewares/admin";
import { errorHandler } from "../error-handler";
import { changeUserRole, createAddress, deleteAddress, getAddress, getUserById, listUsers, updateUser } from "../controllers/user";

const userRoutes : Router = Router();

userRoutes.post('/address',[authMiddleware],errorHandler(createAddress))
userRoutes.get('/address',[authMiddleware],errorHandler(getAddress))
userRoutes.delete('/address/:id',[authMiddleware],errorHandler(deleteAddress))
userRoutes.put('/',[authMiddleware],errorHandler(updateUser))
userRoutes.put('/changeRole/:id',[authMiddleware],errorHandler(changeUserRole))
userRoutes.get('/listUsers',[authMiddleware],errorHandler(listUsers))
userRoutes.get('/listUser/:id',[authMiddleware],errorHandler(getUserById))

export default userRoutes;