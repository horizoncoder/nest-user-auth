import { UserRoleEnum } from '../enums/role.enum';
import { Request } from 'express';

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
