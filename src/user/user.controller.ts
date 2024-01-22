import {
  Controller,
  Get,
  UseGuards,
  Req,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AccessTokenGuard } from '../guard/access-token.guard';
@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AccessTokenGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'User found', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getMe(@Req() req: any): Promise<User> {
    try {
      const userId = req.user.id;

      const user = await this.userService.findUser(userId);

      if (!user) {
        throw new NotFoundException({
          message: 'User not found',
        });
      }

      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
