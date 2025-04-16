import { UserSub } from "src/common/types/user-payload.type";

export interface ApplyImageInput {
  user: UserSub;
  existingKeys: string[] | null;
  newImages: Express.Multer.File[];
  newDescriptions: string[] | null;
}
