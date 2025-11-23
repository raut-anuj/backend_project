export class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
  }s
}

// - ApiResponse → "response" (used to send structured success responses)
