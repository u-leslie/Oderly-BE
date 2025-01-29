import { ErrorCodes, HttpException } from "./root";

export class BadRequestsException extends HttpException {
  constructor(message: string,errorCode:ErrorCodes) {
    super(400, message,errorCode,null);
  }
}