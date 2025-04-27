import { UserSub } from "src/common/types/user-payload.type";

export interface ApplyImageInput {
  user: UserSub;
  existingKeys: string[];
  newImages: { s3_key: string; description?: string }[];
}