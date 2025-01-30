import { Request,Response} from "express";
import { ChangeQuantitySchema, CreateCartSchema } from "../schema/cart";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCodes } from "../exceptions/root";
import { Product } from "@prisma/client";
import { prismaClient } from "..";

export const addItemToCart = async (req:Request, res:Response)=>{
const validatedData = CreateCartSchema.parse(req.body);
let product :Product;
try {
    product = await prismaClient.product.findFirstOrThrow({
        where:{
            id:validatedData.productId
        },

    })
} catch (error) {
    throw new NotFoundException("Product not found",ErrorCodes.PRODUCT_DOES_NOT_EXISTS)
}
const cart = await prismaClient.cartItem.create({
    data:{
        userId:req.user.id,
        productId:product.id,
        quantity:validatedData.quantity
    }
})
res.json({cart})
}

export const changeQuantity = async (req:Request, res:Response)=>{
   const validatedData =ChangeQuantitySchema.parse(req.body)
   const updatedItem = await prismaClient.cartItem.update({
    where:{
        id:req.params.id
    },
    data:{
        quantity:validatedData.quantity
    }
   })
res.json({updatedItem})

}

export const getCart = async (req:Request, res:Response)=>{
const cart = await prismaClient.cartItem.findMany({
    where:{
        userId:req.user.id
    },
    include:{
        product:true
    }
})
res.json({cart})
}

export const removeItemFromCart = async(req:Request, res:Response)=>{
try {
   await prismaClient.cartItem.delete({
    where:{
     id:req.params.id
    }
   })
   res.json({message:"Item removed successfully"})
} catch (error) {
    throw new NotFoundException("Product not found",ErrorCodes.PRODUCT_DOES_NOT_EXISTS)
}
}