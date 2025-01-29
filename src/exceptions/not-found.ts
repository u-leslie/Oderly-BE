import { ErrorCodes, HttpException } from "./root";

export class NotFoundException extends HttpException {
  constructor(message: string,errorCode:ErrorCodes) {
    super(400, message,errorCode,null);
  }
}