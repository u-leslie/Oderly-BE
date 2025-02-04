import { Request, Response } from "express";
import { prismaClient } from "..";
import { ProductSchema } from "../schema/products";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCodes } from "../exceptions/root";

/**
 * @swagger
 * /products/create/:
 *   post:
 *     tags: [Products]
 *     description: Create a new product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
export const createProduct = async (req: Request, res: Response) => {
  ProductSchema.parse(req.body);
  const product = await prismaClient.product.create({
    data: {
      ...req.body,
      tags: req.body.tags.join(","),
    },
  });
  res.json(product);
};

/**
 * @swagger
 * /products/get:
 *   get:
 *     tags: [Products]
 *     description: Get all products
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Total number of products
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */
export const getProducts = async (req: Request, res: Response) => {
  const count = await prismaClient.product.count();
  const products = await prismaClient.product.findMany({
    take: 10,
    skip: 0,
    orderBy: {
      createdAt: "desc",
    },
  });
  res.json({ count, products });
};

/**
 * @swagger
 * /products/get/{id}:
 *   get:
 *     tags: [Products]
 *     description: Get product by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const product = await prismaClient.product.findFirstOrThrow({
      where: { id: id },
    });
    res.json(product);
  } catch (error) {
    throw new NotFoundException(
      "Product not found",
      ErrorCodes.PRODUCT_DOES_NOT_EXISTS
    );
  }
};

/**
 * @swagger
 * /products/update/{id}:
 *   put:
 *     tags: [Products]
 *     description: Update a product by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = req.body;
    const id = req.params.id;
    if (product.tags) {
      product.tags = product.tags.join(",");
    }
    const updatedProduct = await prismaClient.product.update({
      where: {
        id: id,
      },
      data: product,
    });
    res.json(updatedProduct);
  } catch (error) {
    throw new NotFoundException(
      "Product not found",
      ErrorCodes.PRODUCT_DOES_NOT_EXISTS
    );
  }
};

/**
 * @swagger
 * /products/delete/{id}:
 *   delete:
 *     tags: [Products]
 *     description: Delete a product by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Product ID
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    await prismaClient.product.delete({
      where: {
        id: id,
      },
    });
    res.status(204).send("Product deleted successfully");
  } catch (error) {
    throw new NotFoundException(
      "Product not found",
      ErrorCodes.PRODUCT_DOES_NOT_EXISTS
    );
  }
};

/**
 * @swagger
 * /products/search:
 *   get:
 *     tags: [Products]
 *     description: Search products by query (name, description, tags)
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         description: Search term
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of products matching the search query
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
export const searchProduct = async (req: Request, res: Response) => {
  const products = await prismaClient.product.findMany({
    where: {
      name: {
        search: req.query.q?.toString(),
      },
      description: {
        search: req.query.q?.toString(),
      },
      tags: {
        search: req.query.q?.toString(),
      },
    },
  });
  res.json(products);
};

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         tags:
 *           type: string
 *         price:
 *           type: number
 *           format: float
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
