import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository, DeleteResult } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserRoleEnum } from '../enums/role.enum';
import {
  CreateUserInterface,
  UserInterface,
} from '../interfeces/user.interfaces';
import { BanDto, UpdateUserDto } from './user.dto';
import { DeepPartial } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  private mapRoleIdToRole(roleId: number): UserRoleEnum {
    switch (roleId) {
      case 1:
        return UserRoleEnum.Admin;
      case 2:
        return UserRoleEnum.User;
      case 3:
        return UserRoleEnum.Moderator;
      default:
        return UserRoleEnum.User;
    }
  }
  async softDeleteUser(id: number): Promise<DeleteResult> {
    const user = await this.findUser(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.userRepository.softDelete(id);
  }
  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`User  not found`);
    }
    return user;
  }

  async findUser(id: number): Promise<UserInterface> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return {
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      isBanned: user.isBanned,
      role: this.mapRoleIdToRole(user.role?.id),
    };
  }
  async updateUserFields(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserInterface> {
    const result = await this.userRepository.update(id, updateUserDto);

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return await this.findUser(id);
  }

  async banUser(banDto: BanDto): Promise<UserInterface> {
    const { id, isBanned } = banDto;
    const user = await this.findUser(id);

    if (user.role === UserRoleEnum.Admin) {
      throw new BadRequestException('Admins cannot be banned');
    }

    await this.userRepository.update(id, { isBanned });

    return await this.findUser(id);
  }
  async findAllUsers(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: UserInterface[];
    totalPages: number;
    currentPage: number;
  }> {
    const [users, totalUsers] = await this.userRepository.findAndCount({
      relations: ['role'],
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalPages = Math.ceil(totalUsers / limit);

    const mappedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      isBanned: user.isBanned,
      role: this.mapRoleIdToRole(user.role?.id),
    }));

    return { data: mappedUsers, totalPages, currentPage: page };
  }
  async isUserExist(email: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    return !!user;
  }
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`User  not found`);
    }

    return user;
  }
  async create(userData: CreateUserInterface): Promise<User> {
    const user = this.userRepository.create(userData as DeepPartial<User>);
    return this.userRepository.save(user);
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }
  async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
