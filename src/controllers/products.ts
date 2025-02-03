import { Request,Response } from "express";
import { prismaClient } from "..";
import { ProductSchema } from "../schema/products";
import { NotFoundException } from '../exceptions/not-found';
import { ErrorCodes } from "../exceptions/root";

export const createProduct = async(req:Request,res:Response)=>{
    ProductSchema.parse(req.body)
    const product = await prismaClient.product.create({
        data:{
           ...req.body,
           tags:req.body.tags.join(','),
        }
    })
    res.json(product)
}

export const getProducts = async(req:Request,res:Response)=>{
  const count = await prismaClient.product.count()  
    const products = await prismaClient.product.findMany({
        take:10,
        skip:0,
        orderBy:{
            createdAt:'desc'
        }
    })
    res.json({count,products})
}

export const getProductById = async(req:Request,res:Response)=>{
try {
    const id = req.params.id
    const product = await prismaClient.product.findFirstOrThrow({
      where: { id: id },
    });
    res.json(product)
} catch (error) {
   throw new NotFoundException("Product not found",ErrorCodes.PRODUCT_DOES_NOT_EXISTS) 
}

}

export const updateProduct = async(req:Request,res:Response)=>{
try {
    const product = req.body;
    const id = req.params.id;
    if(product.tags){
        product.tags = product.tags.join(',')
    }
    const updatedProduct = await prismaClient.product.update({
    where :{
        id:id,
    },
    data: product
    })
res.json(updatedProduct)
} catch (error) {
  throw new NotFoundException("Product not found",ErrorCodes.PRODUCT_DOES_NOT_EXISTS)  
}
}

export const deleteProduct = async(req:Request,res:Response)=>{
try {
    const id = req.params.id;
    await prismaClient.product.delete({
        where:{
            id:id,
        }
    })
    res.status(204).send("Product deleted successfully")
} catch (error) {
    throw new NotFoundException("Product not found",ErrorCodes.PRODUCT_DOES_NOT_EXISTS)
}
}

export const searchProduct = async(req:Request,res:Response)=>{
    const products = await prismaClient.product.findMany({
        where :{
            name:{
                search:req.query.q?.toString()
            },
            description:{
                search:req.query.q?.toString()
            },
            tags:{
                search:req.query.q?.toString()
            }
        }
    })
    res.json(products)
}