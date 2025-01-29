export class HttpException extends Error {
  errors:any
  status: number;
  message: string;
  errorCode: ErrorCodes;
  constructor(status: number, message: string,errorCode:ErrorCodes,error:any) {
    super(message);
    this.errors=error
    this.status = status;
    this.message = message;
    this.errorCode=errorCode;
  }
}
export enum ErrorCodes{
    USER_ALREADY_EXISTS=1001,
    USER_DOES_NOT_EXISTS=1002,
    INVALID_PASSWORD=1003,
    VALIDATION_ALERTS=1004,
    INTERNAL_EXCEPTION=1005,
    UNAUTHORIZED=1006
}