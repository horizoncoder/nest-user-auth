// role.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';
import { UserRoleEnum } from '../enums/role.enum';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: UserRoleEnum, default: UserRoleEnum.User })
  name: UserRoleEnum;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
