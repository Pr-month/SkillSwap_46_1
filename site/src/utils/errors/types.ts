export interface Error {
  code: string;
  message: string;
  statusCode: number;
  path: string;
  timestamp: string;
}

export interface ErrorResponse {
  message: string;
  errorCode: string;
  originalError: Error;
}
