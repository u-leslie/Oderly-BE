import { Request,Response } from "express";
import { AddressSchema } from "../schema/users";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCodes } from "../exceptions/root";

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

}