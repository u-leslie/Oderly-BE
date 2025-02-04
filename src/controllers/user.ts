import { Request, Response } from "express";
import {
  AddressSchema,
  UpdatedUserSchema,
  UpdateRoleSchema,
} from "../schema/users";
import { prismaClient } from "..";
import { NotFoundException } from "../exceptions/not-found";
import { ErrorCodes } from "../exceptions/root";
import { Address } from "@prisma/client";

/**
 * @swagger
 * user/address:
 *   post:
 *     tags: [User]
 *     summary: Create a new address for the user
 *     description: Create an address linked to the currently authenticated user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Address created successfully
 *       400:
 *         description: Invalid input data
 */
export const createAddress = async (req: Request, res: Response) => {
  AddressSchema.parse(req.body);
  const address = await prismaClient.address.create({
    data: {
      ...req.body,
      userId: req.user?.id,
    },
  });
  res.json(address);
};

/**
 * @swagger
 * user/address/{id}:
 *   delete:
 *     tags: [User]
 *     summary: Delete an address
 *     description: Deletes a user's address based on the address ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the address to be deleted
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       404:
 *         description: Address not found
 */
export const deleteAddress = async (req: Request, res: Response) => {
  try {
    await prismaClient.address.delete({
      where: {
        id: req.params.id,
      },
    });
    res.json({ success: true });
  } catch (error) {
    throw new NotFoundException(
      "Address not found",
      ErrorCodes.ADDRESS_NOT_FOUND
    );
  }
};

/**
 * @swagger
 * user/address:
 *   get:
 *     tags: [User]
 *     summary: Get all addresses for the authenticated user
 *     description: Retrieve all addresses associated with the currently authenticated user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of addresses for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 addresses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Address'
 */
export const getAddress = async (req: Request, res: Response) => {
  const addresses = await prismaClient.address.findMany({
    where: {
      userId: req.user?.id,
    },
  });
  res.json({ addresses });
};

/**
 * @swagger
 * update/user/{id}:
 *   put:
 *     tags: [User]
 *     summary: Update user information
 *     description: Update user profile including address changes and roles
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to update
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: User or address not found
 */
export const updateUser = async (req: Request, res: Response) => {
  const validatedData = UpdatedUserSchema.parse(req.body);
  let shipmentAddress: Address;
  let billingAddress: Address;

  if (validatedData.shippingAddress) {
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

    if (shipmentAddress.userId !== req.user?.id) {
      return new NotFoundException(
        "Address does not belong to this user",
        ErrorCodes.ADDRESS_N0T_FOR_USER
      );
    }
  }

  if (validatedData.billingAddress) {
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

    if (billingAddress.userId !== req.user?.id) {
      return new NotFoundException(
        "Address does not belong to this user",
        ErrorCodes.ADDRESS_N0T_FOR_USER
      );
    }
  }

  const updatedUser = await prismaClient.user.update({
    where: { id: req.user?.id },
    data: validatedData,
  });
  res.json(updatedUser);
};

/**
 * @swagger
 * /user/listUsers:
 *   get:
 *     tags: [User]
 *     summary: List users
 *     description: Get a paginated list of users
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
export const listUsers = async (req: Request, res: Response) => {
  const users = await prismaClient.user.findMany({
    skip: 0,
    take: 5,
  });
  res.json(users);
};

/**
 * @swagger
 * /user/listUser/{id}:
 *   get:
 *     tags: [User]
 *     summary: Get a user by ID
 *     description: Get a user's details by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to retrieve
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: The user's details
 *       404:
 *         description: User not found
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await prismaClient.user.findFirstOrThrow({
      where: {
        id: req.params.id,
      },
      include: {
        addresses: true,
      },
    });
    res.json(user);
  } catch (error) {
    throw new NotFoundException(
      "User not found",
      ErrorCodes.USER_DOES_NOT_EXISTS
    );
  }
};

/**
 * @swagger
 * /user/{id}/role:
 *   put:
 *     tags: [User]
 *     summary: Change user role
 *     description: Update the role of a user
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user whose role to update
 *       - in: body
 *         name: role
 *         required: true
 *         description: The new role of the user
 *         schema:
 *           type: object
 *           properties:
 *             role:
 *               type: string
 *               description: The role to assign to the user
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       404:
 *         description: User not found
 */
export const changeUserRole = async (req: Request, res: Response) => {
  // UpdateRoleSchema.parse(req.body);
  try {
    const user = await prismaClient.user.update({
      where: {
        id: req.params.id,
      },
      data: {
        role: req.body.role,
      },
    });
    res.json(user);
  } catch (error) {
    throw new NotFoundException(
      "User not found",
      ErrorCodes.USER_DOES_NOT_EXISTS
    );
  }
};
