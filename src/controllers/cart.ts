import { Request, Response } from "express";
import { ChangeQuantitySchema, CreateCartSchema } from "../schema/cart";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCodes } from "../exceptions/root";
import { Product } from "@prisma/client";
import { prismaClient } from "..";

/**
 * @swagger
 * /cart/create:
 *   post:
 *     summary: Add an item to the cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *                 example: "12345"
 *               quantity:
 *                 type: number
 *                 example: 2
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Item successfully added to the cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cart:
 *                   type: object
 *       404:
 *         description: Product not found
 */
export const addItemToCart = async (req: Request, res: Response) => {
  const validatedData = CreateCartSchema.parse(req.body);
  let product: Product;
  try {
    product = await prismaClient.product.findFirstOrThrow({
      where: {
        id: validatedData.productId,
      },
    });
  } catch (error) {
    throw new NotFoundException("Product not found", ErrorCodes.PRODUCT_DOES_NOT_EXISTS);
  }

  if (!req.user) {
    throw new NotFoundException("User not found", ErrorCodes.USER_DOES_NOT_EXISTS);
  }

  const cart = await prismaClient.cartItem.create({
    data: {
      userId: req.user.id,
      productId: product.id,
      quantity: validatedData.quantity,
    },
  });
  res.json({ cart });
};

/**
 * @swagger
 * /cart/{id}/change:
 *   put:
 *     summary: Change the quantity of an item in the cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 example: 3
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Item quantity updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updatedItem:
 *                   type: object
 */
export const changeQuantity = async (req: Request, res: Response) => {
  const validatedData = ChangeQuantitySchema.parse(req.body);
  const updatedItem = await prismaClient.cartItem.update({
    where: {
      id: req.params.id,
    },
    data: {
      quantity: validatedData.quantity,
    },
  });
  res.json({ updatedItem });
};

/**
 * @swagger
 * /cart/getCart:
 *   get:
 *     summary: Get the current user's cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the user's cart items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cart:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "12345"
 *                       product:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Laptop"
 *                           price:
 *                             type: number
 *                             example: 1000
 */
export const getCart = async (req: Request, res: Response) => {
  const cart = await prismaClient.cartItem.findMany({
    where: {
      userId: req.user?.id,
    },
    include: {
      product: true,
    },
  });
  res.json({ cart });
};

/**
 * @swagger
 * /cart/delete/{id}:
 *   delete:
 *     summary: Remove an item from the cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Cart item ID
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Item removed successfully
 *       404:
 *         description: Item not found
 */
export const removeItemFromCart = async (req: Request, res: Response) => {
  try {
    await prismaClient.cartItem.delete({
      where: {
        id: req.params.id,
      },
    });
    res.json({ message: "Item removed successfully" });
  } catch (error) {
    throw new NotFoundException("Product not found", ErrorCodes.PRODUCT_DOES_NOT_EXISTS);
  }
};
