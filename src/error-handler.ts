import { NextFunction,Request,Response } from "express"
import { ErrorCodes, HttpException } from "./exceptions/root"
import { internalException } from "./exceptions/internal-exception"

export const errorHandler = (method:Function)=>{
    return async (req:Request,res:Response,next:NextFunction)=>{
     try {
       await method(req,res,next)
     } catch (error) {
        let exception:HttpException
       if(error instanceof HttpException){
   exception = error
       } else{
        exception = new internalException("Internal server error",error,ErrorCodes.INTERNAL_EXCEPTION)
       }
         next(exception);
     }
     
    }
}