import {NextFunction, Request, Response} from 'express';
import { ErrorCodes } from '../exceptions/root';
import { UnauthorizedException } from '../exceptions/unauthorized';
import * as jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../secrets';
import { prismaClient } from '..';

const authMiddleware = async(req:Request, res:Response, next:NextFunction)=>{
  const token = req.headers.authorization;

  if (!token) {
    next(new UnauthorizedException("Unauthorized", ErrorCodes.UNAUTHORIZED));
  }
  try {
    const payload = jwt.verify(token as string, JWT_SECRET) as any;
    const user = await prismaClient.user.findFirst({
      where: { id: payload.id },
    });
    if (user) {
      req.user = user;
      next();
    } else {
      next(new UnauthorizedException("Unauthorized", ErrorCodes.UNAUTHORIZED));
    }
  } catch (error) {
    next(new UnauthorizedException("Unauthorized", ErrorCodes.UNAUTHORIZED));
  }
}
export default authMiddleware;