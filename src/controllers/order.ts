import { Request,Response } from "express";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCodes } from "../exceptions/root";

export const createOrder = async (req: Request, res: Response)=>{
return await prismaClient.$transaction(async(tx)=>{
    const cartItems = await tx.cartItem.findMany({
        where :{
            userId: req.user?.id
        },
        include:{
            product:true
        }   
    })
    if(cartItems.length == 0){
        return res.json({message: "No cart items found"})
    }
    const price = cartItems.reduce((prev,current)=>{
return prev + (current.quantity * current.product.price)
    },0)
    const address = await tx.address.findFirst({
        where:{
            userId: req.user?.billingAddressId
        }
    })
    const order = await tx.order.create({
        data:{
            userId:req.user?.id,
            netAmount:price,
            address:address.formattedAddress,
            products:{
                create:cartItems.map((cart)=>{
                    return {
                        productId:cart.productId,
                        quantity:cart.quantity
                    }
                })
            }

        }
    })
    const orderEvent = await tx.orderEvent.create({
        data:{
            orderId:order.id,
            
        }
    })
    await tx.cartItem.deleteMany({
        where:{
            userId: req.user?.id
        }
    })

    return res.json({message: "Order placed successfully", order})

})
}

export const getOrders = async (req: Request, res: Response)=>{
const orders = await prismaClient.order.findMany({
    where:{
        userId:req.user?.id
    }
})
res.json(orders)
}

export const cancelOrder = async(req: Request, res: Response)=>{
return await prismaClient.$transaction(async (tx)=>{
    try {
      const order = await tx.order.update({
        where: {
          id: req.params.orderId,
          // userId:req.user?.id
        },
        data: {
          status: "CANCELLED",
        },
      });
      await tx.orderEvent.create({
        data: {
          orderId: order.id,
          status: "CANCELLED",
        },
      });
    } catch (error) {
      throw new NotFoundException(
        "Order not found",
        ErrorCodes.ORDER_NOT_FOUND
      );
    }
})
}

export const getOrderById = async (req: Request, res: Response)=>{
try {
   const order = await prismaClient.order.findFirstOrThrow({
    where:{
        id:req.params.orderId,
        // userId:req.user?.id
    },
    include:{
        products:true,
        events:true
    }
   })
} catch (error) {
    throw new NotFoundException("Order not found",ErrorCodes.ORDER_NOT_FOUND)
}
}


export const listAllOrders = async(req: Request, res: Response)=>{
    let whereClause = {}
const status = req.params.status
if (status){
    whereClause = {
        status
    }
}
const orders = await prismaClient.order.findMany({
    where:whereClause,
    skip:req.query.skip || 0,
    take:5
 
})
res.json(orders)

}

export const ChangeStatus = async (req: Request, res: Response) => {
  return await prismaClient.$transaction(async(tx)=>{
      try {
        const order = await tx.order.update({
          where: {
            id: req.params.id,
            // userId: req.user?.id
          },
          data: {
            status: req.body.status,
          },
        });
        await tx.orderEvent.create({
          data: {
            orderId: order.id,
            status: req.body.status,
          },
        });
        res.json(order);
      } catch (error) {
        throw new NotFoundException(
          "Order not found",
          ErrorCodes.ORDER_NOT_FOUND
        );
      }
  })
};


export const listUserOrders = async (req: Request, res: Response) => {
        let whereClause:any = {
            userId:req.params.id
        };
        const status = req.query.status;
        if (status) {
          whereClause = {
            ...whereClause,
            status,
          };
        }
        const orders = await prismaClient.order.findMany({
          where: whereClause,
          skip: req.query.skip || 0,
          take: 5,
        });
        res.json(orders);

};