export type ApiErrorCode =
  | "UNAUTHENTICATED"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "NETWORK_ERROR"
  | "INTERNAL_ERROR";

export class ApiError extends Error {
  status: number;
  code: ApiErrorCode;

  constructor(
    message: string,
    status: number,
    code: ApiErrorCode
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}