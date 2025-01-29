import {NextFunction, Request,Response} from "express"
import { prismaClient } from "..";
import {hashSync,compareSync} from "bcrypt"
import * as jwt from "jsonwebtoken"
import { JWT_SECRET } from "../secrets";
import { BadRequestsException } from "../exceptions/bad-req";
import { ErrorCodes } from "../exceptions/root";
import { ValidationAlerts } from "../exceptions/validation";
import { SignupSchema } from "../schema/users";
import { NotFoundException } from "../exceptions/not-found";

export const signup = async(req: Request, res: Response,next:NextFunction)=>{
  SignupSchema.parse(req.body);
  const { username, email, password } = req.body;
  let user = await prismaClient.user.findFirst({ where: { email } });
  if (user) {
    
      new BadRequestsException(
        "User already exists",
        ErrorCodes.USER_ALREADY_EXISTS
    
    );
  }
  user = await prismaClient.user.create({
    data: {
      username,
      email,
      password: hashSync(password, 10),
    },
  });
  res.json(user);
}

export const login = async(req: Request, res: Response,next:NextFunction)=>{
    const {email,password}= req.body;
    let user = await prismaClient.user.findFirst({where:{email}})
    if(!user){
       throw new NotFoundException("User not found",ErrorCodes.USER_DOES_NOT_EXISTS);
    }
    if(!compareSync(password,user.password)){
        throw new BadRequestsException("Incorrect password",ErrorCodes.INVALID_PASSWORD);
    } 
    const token = jwt.sign({
        id:user.id,
        email:user.email,
    },JWT_SECRET)
   res.json({user,token})
    }

export const profile = async(req: Request, res: Response,next:NextFunction)=>{
    res.json(req.user)
}