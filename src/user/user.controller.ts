import {
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Req,
  UseGuards,
  Query,
  Delete,
  Patch,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { ApiBearerAuth, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { AccessTokenGuard } from '../guard/access-token.guard';
import { UserInterface, UserReq } from '../interfeces/user.interfaces';
import { Roles } from '../decorators/role.decorator';
import { UserRoleEnum } from '../enums/role.enum';
import { RolesGuard } from '../guard/role.guard';
import { BanDto, UpdateUserDto } from './user.dto';
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AccessTokenGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'User found', type: User })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getMe(@Req() req: UserReq): Promise<UserInterface> {
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

  @UseGuards(AccessTokenGuard)
  @Delete('/soft')
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'User successfully soft deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async softDeleteUser(@Req() req: UserReq) {
    try {
      const userId = req.user.id;
      await this.userService.softDeleteUser(userId);
      return { message: 'User successfully soft deleted' };
    } catch (err: unknown) {
      throw new InternalServerErrorException(err);
    }
  }
  @UseGuards(AccessTokenGuard)
  @Patch('update')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'User successfully updated',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserFields(
    @Req() req: UserReq,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{ message: string; user: UserInterface }> {
    try {
      const userId = req.user.id;
      const updatedUser = await this.userService.updateUserFields(
        userId,
        updateUserDto,
      );
      return { message: 'User successfully updated', user: updatedUser };
    } catch (err: unknown) {
      throw new InternalServerErrorException(err);
    }
  }

  @Roles(UserRoleEnum.Admin)
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Patch('ban')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'User ban status has been changed',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async banUser(
    @Body() banDto: BanDto,
  ): Promise<{ message: string; user: UserInterface }> {
    try {
      const updatedUser = await this.userService.banUser(banDto);
      return { message: 'User banned status change', user: updatedUser };
    } catch (err: unknown) {
      throw new InternalServerErrorException(err);
    }
  }
}
