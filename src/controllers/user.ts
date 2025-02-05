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
 * /user/address:
 *   post:
 *     tags: [User]
 *     summary: Create a new address for the user
 *     description: Create an address linked to the currently authenticated user.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *                 example: "123 Main Street"
 *                 description: The street name and number.
 *               city:
 *                 type: string
 *                 example: "New York"
 *                 description: The city of the address.
 *               state:
 *                 type: string
 *                 example: "NY"
 *                 description: The state or province.
 *               zipCode:
 *                 type: string
 *                 example: "10001"
 *                 description: The postal or ZIP code.
 *               country:
 *                 type: string
 *                 example: "USA"
 *                 description: The country name.
 *     responses:
 *       201:
 *         description: Address created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
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
 * /user/address/{id}:
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
 * /user/address:
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
 * /user/update/user/{id}:
 *   put:
 *     tags: [User]
 *     summary: Update user information
 *     description: Update user profile including address changes, roles, and contact details.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to update
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "JohnDoe"
 *                 description: The new username of the user
 *               shippingAddressId:
 *                 type: string
 *                 format: uuid
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *                 description: ID of the shipping address
 *               billingAddressId:
 *                 type: string
 *                 format: uuid
 *                 example: "110e8400-e29b-41d4-a716-556655440001"
 *                 description: ID of the billing address
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: User or address not found
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */

export const updateUser = async (req: Request, res: Response) => {
  const validatedData = UpdatedUserSchema.parse(req.body);
  let shipmentAddressId: Address;
  let billingAddressId: Address;

  if (validatedData.shippingAddressId) {
    try {
      shipmentAddressId = await prismaClient.address.findFirstOrThrow({
        where: {
          id: validatedData.shippingAddressId,
        },
      });
    } catch (error) {
      throw new NotFoundException(
        "Address not found",
        ErrorCodes.ADDRESS_NOT_FOUND
      );
    }

    if (shipmentAddressId.userId !== req.user?.id) {
      return new NotFoundException(
        "Address does not belong to this user",
        ErrorCodes.ADDRESS_N0T_FOR_USER
      );
    }
  }

  if (validatedData.billingAddressId) {
    try {
      billingAddressId = await prismaClient.address.findFirstOrThrow({
        where: {
          id: validatedData.billingAddressId,
        },
      });
    } catch (error) {
      throw new NotFoundException(
        "Address not found",
        ErrorCodes.ADDRESS_NOT_FOUND
      );
    }

    if (billingAddressId.userId !== req.user?.id) {
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
 *         schema:
 *           type: string
 *         description: The ID of the user whose role is to be updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: 
 *               - role  # Ensures 'role' is required in Swagger
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER] 
 *                 description: The role to assign to the user
 *     security:
 *       - BearerAuth: []  
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

export const changeUserRole = async (req: Request, res: Response) => {
  UpdateRoleSchema.parse(req.body);
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
