import { Request, Response } from "express";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCodes } from "../exceptions/root";

/**
 * @swagger
 * /orders/create:
 *   post:
 *     tags: [Order]
 *     summary: Create an order
 *     description: Creates an order for a user by processing the items in their cart.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Order placed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order placed successfully
 *                 orderEvent:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The ID of the order event.
 *       400:
 *         description: Invalid request data or missing user/cart/address.
 *       404:
 *         description: User, cart items, or address not found.
 */
export const createOrder = async (req: Request, res: Response) => {
  return await prismaClient.$transaction(async (tx) => {
    if (!req.user) {
      throw new NotFoundException(
        "User not found",
        ErrorCodes.USER_DOES_NOT_EXISTS
      );
    }

    const cartItems = await tx.cartItem.findMany({
      where: {
        userId: req.user?.id,
      },
      include: {
        product: true,
      },
    });

    if (cartItems.length === 0) {
      return res.json({ message: "No cart items found" });
    }

    const price = cartItems.reduce((prev, current) => {
      return prev + current.quantity * current.product.price;
    }, 0);

    if (!req.user.shippingAddressId) {
      throw new NotFoundException(
        "Address not found",
        ErrorCodes.ADDRESS_NOT_FOUND
      );
    }

    const address = await tx.address.findFirst({
      where: {
        id: req.user.shippingAddressId,
      },
    });

    if (!address) {
      throw new NotFoundException(
        "Address not found",
        ErrorCodes.ADDRESS_NOT_FOUND
      );
    }

    const order = await tx.order.create({
      data: {
        userId: req.user.id,
        netAmount: price,
        address: address.formattedAddress,
        products: {
          create: cartItems.map((cart) => ({
            productId: cart.productId,
            quantity: cart.quantity,
          })),
        },
      },
    });

    await tx.orderEvent.create({
      data: {
        orderId: order.id,
      },
    });

    await tx.cartItem.deleteMany({
      where: {
        userId: req.user?.id,
      },
    });

    return res.json({ message: "Order placed successfully", order });
  });
};
/**
 * @swagger
 * /orders/getAll:
 *   get:
 *     tags: [Order]
 *     summary: Get all orders for a user
 *     description: Retrieves all orders placed by the user.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of orders for the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The order ID.
 *                   status:
 *                     type: string
 *                     description: The order status.
 *       404:
 *         description: User not found.
 */
export const getOrders = async (req: Request, res: Response) => {
  const orders = await prismaClient.order.findMany({
    where: { userId: req.user?.id },
  });
  res.json(orders);
};

/**
 * @swagger
 * /orders/cancel/{orderId}:
 *   put:
 *     tags: [Order]
 *     summary: Cancel an order
 *     description: Cancels the specified order by updating its status.
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         description: The ID of the order to cancel.
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Order cancelled successfully.
 *       404:
 *         description: Order not found.
 */
export const cancelOrder = async (req: Request, res: Response) => {
  return await prismaClient.$transaction(async (tx) => {
    try {
      const existingOrder = await tx.order.findUnique({
        where: { id: req.params.id },
      });

      if (!existingOrder) {
        throw new NotFoundException(
          "Order not found",
          ErrorCodes.ORDER_NOT_FOUND
        );
      }

      const order = await tx.order.update({
        where: { id: req.params.id },
        data: { status: "CANCELLED" },
      });

      await tx.orderEvent.create({
        data: {
          orderId: order.id,
          status: "CANCELLED",
        },
      });

      res.json({ message: "Order cancelled successfully", order });
    } catch (error) {
      console.error("Error cancelling order:", error);
      throw new NotFoundException(
        "Order not found",
        ErrorCodes.ORDER_NOT_FOUND
      );
    }
  });
};

/**
 * @swagger
 * /orders/get/{orderId}:
 *   get:
 *     tags: [Order]
 *     summary: Get order details by ID
 *     description: Retrieves detailed information about a specific order, including its products and events.
 *     parameters:
 *       - name: orderId
 *         in: path
 *         required: true
 *         description: The ID of the order to retrieve.
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Order details.
 *       404:
 *         description: Order not found.
 */
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await prismaClient.order.findFirstOrThrow({
      where: { id: req.params.orderId },
      include: { products: true, events: true },
    });
      res.json(order);
  } catch (error) {
    throw new NotFoundException("Order not found", ErrorCodes.ORDER_NOT_FOUND);
  }
};

/**
 * @swagger
 * /orders:
 *   get:
 *     tags: [Order]
 *     summary: List all orders with an optional status filter
 *     description: Retrieves all orders with an optional filter for status.
 *     parameters:
 *       - name: status
 *         in: query
 *         required: false
 *         description: Filter orders by their status.
 *         schema:
 *           type: string
 *           enum: [PENDING,ACCEPTED,OUT_FOR_DELIVERY,DELIVERED,CANCELLED]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of orders.
 *       400:
 *         description: Invalid status filter.
 */
export const listAllOrders = async (req: Request, res: Response) => {
  let whereClause = {};
  const status = req.params.status;
  if (status) {
    whereClause =  status ;
  }
  const orders = await prismaClient.order.findMany({
    where: whereClause,
    skip: 0,
    take: 5,
  });
  res.json(orders);
};

/**
 * @swagger
 * /orders/status/{id}:
 *   put:
 *     tags: [Order]
 *     summary: Change the status of an order
 *     description: Updates the status of a specific order.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the order.
 *         schema:
 *           type: string
 *       - name: status
 *         in: body
 *         required: true
 *         description: The new status of the order.
 *         schema:
 *           type: string
 *           enum: [  PENDING,ACCEPTED,OUT_FOR_DELIVERY,DELIVERED,CANCELLED]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: The order's status has been updated.
 *       404:
 *         description: Order not found.
 */
export const ChangeStatus = async (req: Request, res: Response) => {
  return await prismaClient.$transaction(async (tx) => {
    try {
      const order = await tx.order.update({
        where: { id: req.params.id },
        data: { status: req.body.status },
      });

      await tx.orderEvent.create({
        data: { orderId: order.id, status: req.body.status },
      });

      res.json(order);
    } catch (error) {
      throw new NotFoundException(
        "Order not found",
        ErrorCodes.ORDER_NOT_FOUND
      );
    }
  });
};

/**
 * @swagger
 * /orders/orderByUser/{id}:
 *   get:
 *     tags: [Order]
 *     summary: List orders for a specific user
 *     description: Retrieves a list of orders for the specified user with optional status filter.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the user for whom the orders are being fetched.
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         required: false
 *         description: Optional filter for order status.
 *         schema:
 *           type: string
 *           enum: [  PENDING,ACCEPTED,OUT_FOR_DELIVERY,DELIVERED,CANCELLED]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of orders for the user.
 *       404:
 *         description: User not found.
 */
export const listUserOrders = async (req: Request, res: Response) => {
  let whereClause: any = { userId: req.params.id };
  const status = req.query.status;
  if (status) {
    whereClause = { ...whereClause, status };
  }
  const orders = await prismaClient.order.findMany({
    where: whereClause,
    skip: 0,
    take: 5,
  });
  res.json(orders);
};
