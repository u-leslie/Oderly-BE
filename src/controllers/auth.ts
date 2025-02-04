import { NextFunction, Request, Response } from "express";
import { prismaClient } from "..";
import { hashSync, compareSync } from "bcrypt";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import { BadRequestsException } from "../exceptions/bad-req";
import { ErrorCodes } from "../exceptions/root";
import { SignupSchema } from "../schema/users";
import { NotFoundException } from "../exceptions/not-found";

/**
 * @swagger
 * auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               password:
 *                 type: string
 *                 example: "securepassword"
 *     responses:
 *       200:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "12345"
 *                 username:
 *                   type: string
 *                   example: "johndoe"
 *                 email:
 *                   type: string
 *                   example: "johndoe@example.com"
 *       400:
 *         description: User already exists
 */
export const signup = async (req: Request, res: Response, next: NextFunction) => {
  SignupSchema.parse(req.body);
  const { username, email, phone, password } = req.body;
  let user = await prismaClient.user.findFirst({ where: { email } });
  if (user) {
    throw new BadRequestsException("User already exists", ErrorCodes.USER_ALREADY_EXISTS);
  }
  user = await prismaClient.user.create({
    data: {
      username,
      email,
      phone,
      password: hashSync(password, 10),
    },
  });
  res.json(user);
};

/**
 * @swagger
 * auth/login:
 *   post:
 *     summary: Authenticate user and return JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: securepassword
 *     responses:
 *       200:
 *         description: Successful authentication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "12345"
 *                     email:
 *                       type: string
 *                       example: "johndoe@example.com"
 *                 token:
 *                   type: string
 *                   example: "jwt.token.here"
 *       400:
 *         description: Incorrect password
 *       404:
 *         description: User not found
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  let user = await prismaClient.user.findFirst({ where: { email } });
  if (!user) {
    throw new NotFoundException("User not found", ErrorCodes.USER_DOES_NOT_EXISTS);
  }
  if (!compareSync(password, user.password)) {
    throw new BadRequestsException("Incorrect password", ErrorCodes.INVALID_PASSWORD);
  }
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    JWT_SECRET
  );
  res.json({ user, token });
};

/**
 * @swagger
 * auth/profile:
 *   get:
 *     summary: Get authenticated user's profile
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Returns user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "12345"
 *                 email:
 *                   type: string
 *                   example: "johndoe@example.com"
 *       401:
 *         description: Unauthorized
 */
export const profile = async (req: Request, res: Response, next: NextFunction) => {
  res.json(req.user);
};
