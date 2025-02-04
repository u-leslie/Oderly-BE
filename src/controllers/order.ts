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
    // Function logic
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
 * /orders/{orderId}/cancel:
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
    // Function logic
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
 *           enum: [pending, delivered, cancelled]
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
    whereClause = { status };
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
 * /orders/{id}/status:
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
 *           enum: [pending, completed, cancelled]
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
    // Function logic
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
 *           enum: [pending, completed, canceled]
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
