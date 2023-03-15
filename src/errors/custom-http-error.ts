export class CustomHTTPError extends Error {
  #code: string | undefined;
  httpCode: number;

  constructor(httpCode: number, msg: string, code?: string) {
    super(msg);
    this.#code = code;
    this.httpCode = httpCode;
  }

  toBodyJSON() {
    return {
      msg: this.message,
      code: this.#code,
    };
  }
}
