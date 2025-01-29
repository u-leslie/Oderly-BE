import { NextFunction, Request, Response } from "express";
import { ErrorCodes } from "../exceptions/root";
import { UnauthorizedException } from "../exceptions/unauthorized";

const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    const user = req.user;
    if(user && user.role === "ADMIN"){
next()
    }else{
    next(new UnauthorizedException("Unauthorized", ErrorCodes.UNAUTHORIZED));
    }
  


};
export default adminMiddleware;
