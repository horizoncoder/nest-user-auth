import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoleEnum } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
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
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(
      (role) => this.mapRoleIdToRole(user.role) === role,
    );
  }
}
