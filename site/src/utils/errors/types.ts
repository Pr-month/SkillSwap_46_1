export type Error = {
  code: string;
  path: string;
  statusCode: number;
  timestamp: Date;
};

export interface ErrorResponse {
  message: string;
  errorCode: string;
  originalError: Error;
}
