import { NextFunction,Request,Response } from "express"
import { ErrorCodes, HttpException } from "./exceptions/root"
import { internalException } from "./exceptions/internal-exception"
import { ZodError } from "zod"
import { BadRequestsException } from "./exceptions/bad-req"

export const errorHandler = (method:Function)=>{
    return async (req:Request,res:Response,next:NextFunction)=>{
     try {
       await method(req,res,next)
     } catch (error) {
        let exception:HttpException
       if(error instanceof HttpException){
   exception = error
       } else{
        if(error instanceof ZodError){
          exception = new BadRequestsException("Validation error",ErrorCodes.VALIDATION_ALERTS)
        }
        exception = new internalException("Internal server error",error,ErrorCodes.INTERNAL_EXCEPTION)
       }
         next(exception);
     }
     
    }
}