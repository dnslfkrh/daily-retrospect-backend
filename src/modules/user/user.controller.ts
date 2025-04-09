import { Body, Controller, Delete, Query } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "src/common/decorators/user.decorator";
import { UserSub } from "src/common/types/user-payload.type";
import { ConfirmDeleteUserDto } from "./dto/email.dto";

@Controller("user")
export class UserController {
  constructor(
    private readonly userService: UserService
  ) { }

  @Delete("delete")
  async deleteUser(
    @User() user: UserSub,
    @Query("email") email: string
  ) {
    return await this.userService.deleteUser(user, email);
  }
}
