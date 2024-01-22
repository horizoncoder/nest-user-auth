import { UserRoleEnum } from '../enums/role.enum';

export interface UserInterface {
  id: number;
  email: string;
  name: string;
  surname: string;
  role: UserRoleEnum;
  isBanned: boolean;
}
