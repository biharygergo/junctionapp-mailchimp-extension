import { Request } from "express";

export const validateAPIKey = (request: Request) => {
  return request.query.key && request.query.key === process.env.API_KEY;
};
