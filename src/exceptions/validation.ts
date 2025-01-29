import { ErrorCodes, HttpException } from "./root";

export class ValidationAlerts extends HttpException{
    constructor(errors:any, message:string,errorCode:ErrorCodes){
        super(422,message,errorCode,errors)
    }
}