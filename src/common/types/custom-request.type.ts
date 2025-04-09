import { Request } from "express";
import { UserSub } from "./user-payload.type";

export interface CustomRequest extends Request {
  user?: UserSub;
}
