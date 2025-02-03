import { Request,Response } from "express";
import { AddressSchema, UpdatedUserSchema, UpdateRoleSchema } from "../schema/users";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCodes } from "../exceptions/root";
import { Address } from "@prisma/client"

export const createAddress = async (req: Request, res: Response)=>{
  AddressSchema.parse(req.body);
    const address = await prismaClient.address.create({
        data:{
            ...req.body,
            userId:req.user?.id
            }
    })
    res.json(address)  

}
export const deleteAddress = async (req: Request, res: Response) => {
try {
    await prismaClient.address.delete({
        where :{
            id:req.params.id
        }
})
res.json({success:true})
} catch (error) {
    throw new NotFoundException( "Address not found",ErrorCodes.ADDRESS_NOT_FOUND)
}
};

export const getAddress = async (req: Request, res: Response) => {
const addresses = await prismaClient.address.findMany({
    where :{
        userId:req.user?.id
    }
})
res.json({addresses})
};

export const updateUser = async (req: Request, res: Response) => {
const validatedData = UpdatedUserSchema.parse(req.body)
let shipmentAddress : Address
let billingAddress : Address
if (validatedData.shippingAddress){
     try {
       shipmentAddress = await prismaClient.address.findFirstOrThrow({
         where: {
           id: validatedData.shippingAddress,
         },
       });
     } catch (error) {
       throw new NotFoundException(
         "Address not found",
         ErrorCodes.ADDRESS_NOT_FOUND
       );
     }

     if(shipmentAddress.userId != req.user.id){
        return new NotFoundException("Address does not belong to this user", ErrorCodes.ADDRESS_N0T_FOR_USER)
}}
if (validatedData.billingAddress){
     try {
       billingAddress = await prismaClient.address.findFirstOrThrow({
         where: {
           id: validatedData.billingAddress,
         },
       });
     } catch (error) {
       throw new NotFoundException(
         "Address not found",
         ErrorCodes.ADDRESS_NOT_FOUND
       );
     }
          if(billingAddress.userId != req.user.id){
        return new NotFoundException("Address does not belong to this user", ErrorCodes.ADDRESS_N0T_FOR_USER)
}
}
const updatedUser = await prismaClient.user.update({
    where: { id: req.user?.id },
    data:validatedData,
})
res.json(updatedUser);
}

export const listUsers = async(req:Request,res:Response)=>{
const users = await prismaClient.user.findMany({
  skip:req.query.skip || 0,
  take:5
})
res.json(users)
}

export const getUserById = async(req:Request,res:Response)=>{
try {
  const user = await prismaClient.user.findFirstOrThrow({
    where:{
      id:req.params.id
    },
    include:{
      addresses:true
    }
  })
  res.json(user)
} catch (error) {
 throw new NotFoundException("User not found",ErrorCodes.USER_DOES_NOT_EXISTS) 
}
}

export const changeUserRole = async(req:Request,res:Response)=>{
  UpdateRoleSchema.parse(req.body)
  try {
    const user = await prismaClient.user.update({
      where: {
        id: req.params.id,
      },
   data:{
    role:req.body.role
   }
    });
    res.json(user);
  } catch (error) {
    throw new NotFoundException(
      "User not found",
      ErrorCodes.USER_DOES_NOT_EXISTS
    );
  }
}