import {NextFunction, Request, Response} from 'express';
import { ErrorCodes } from '../exceptions/root';
import { UnauthorizedException } from '../exceptions/unauthorized';
import * as jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../secrets';
import { prismaClient } from '..';


const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log("Headers received:", req.headers);

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(
      new UnauthorizedException("Unauthorized", ErrorCodes.UNAUTHORIZED)
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;

    const user = await prismaClient.user.findFirst({
      where: { id: payload.id },
    });

    if (user) {
      req.user = user;
      return next();
    } else {
      return next(
        new UnauthorizedException("Unauthorized", ErrorCodes.UNAUTHORIZED)
      );
    }
  } catch (error) {
    return next(
      new UnauthorizedException("Unauthorized", ErrorCodes.UNAUTHORIZED)
    );
  }
};



export default authMiddleware;