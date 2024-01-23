import {
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Req,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { ApiBearerAuth, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { AccessTokenGuard } from '../guard/access-token.guard';
import { UserInterface } from '../interfeces/user.interfaces';
import { Roles } from '../decorators/role.decorator';
import { UserRoleEnum } from '../enums/role.enum';
import { RolesGuard } from '../guard/role.guard';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AccessTokenGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'User found', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getMe(@Req() req: any): Promise<UserInterface> {
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

  @Get('all')
  @Roles(UserRoleEnum.Moderator, UserRoleEnum.Admin)
  @UseGuards(AccessTokenGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiQuery({
    name: 'page',
    type: Number,
    required: true,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: true,
    description: 'Number of items per page',
  })
  @ApiResponse({ status: 200, description: 'List of users', type: [User] })
  async findAllUsers(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ): Promise<{
    data: UserInterface[];
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const result = await this.userService.findAllUsers(page, limit);

      return {
        data: result.data,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
      };
    } catch (err: unknown) {
      throw new InternalServerErrorException(err);
    }
  }
}
