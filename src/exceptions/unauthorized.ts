import { ErrorCodes, HttpException } from "./root";

export class UnauthorizedException extends HttpException {
  constructor(message: string, errorCode: ErrorCodes,errors?:any) {
    super(401, message, errorCode, errors);
  }
}
