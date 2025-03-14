import { Request } from "express";
import { UserSub } from "./Payload";

export interface CustomRequest extends Request {
  user?: UserSub;
}
