import { ErrorCodes, HttpException } from "./root";

export class internalException extends HttpException {
    constructor(message:string,errors:any,errorCode:ErrorCodes){
        super(500,message,errorCode,errors)
    }
}