import { UserRoleEnum } from '../enums/role.enum';
import { Request } from 'express';
import { User } from '../user/user.entity';

export interface UserInterface {
  id: number;
  email: string;
  name: string;
  surname: string;
  role: UserRoleEnum;
  isBanned: boolean;
}
export interface UserReq extends Request {
  user: {
    id: number;
    role: number;
  };
}
export interface CreateUserInterface {
  name: string;
  surname: string;
  email: string;
  password: string;
  isBanned: boolean;
  role: number;
}
