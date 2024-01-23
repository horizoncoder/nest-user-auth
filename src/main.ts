import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { RoleService } from './role/role.service';
import * as cookieParser from 'cookie-parser';
import { UserRoleEnum } from './enums/role.enum';
import { UserService } from './user/user.service';
import { CreateUserInterface } from './interfeces/user.interfaces';

async function seedUsers(userService: UserService) {
  const usersArray = JSON.parse(process.env.USERS_ARRAY || '[]');

  await Promise.all(
    usersArray.map(async (user) => {
      const userExists = await userService.isUserExist(user.email);

      if (!userExists) {
        const newUser: CreateUserInterface = {
          email: user.email,
          name: user.name,
          surname: user.surname,
          isBanned: false,
          password: await userService.hashPassword(user.password),
          role: user.role === 'admin' ? 1 : 3,
        };
        console.log(`User with email ${user.email} added.`);
        return userService.create(newUser);
      } else {
        console.log(`User with email ${user.email} already exists. Skipping.`);
        return null;
      }
    }),
  );
}

async function seedRoles(roleService: RoleService) {
  const roles: UserRoleEnum[] = [
    UserRoleEnum.Admin,
    UserRoleEnum.User,
    UserRoleEnum.Moderator,
  ];

  for (const roleName of roles) {
    let role = await roleService.findOneByName(roleName);

    if (!role) {
      role = await roleService.create({ name: roleName });
      console.log(`role ${role.name} added`);
    } else {
      console.log(`role ${role.name} already exists. Skipping.`);
    }
  }
}
async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Users API ')
    .setDescription('User API Description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  const roleService = app.get(RoleService);
  const userService = app.get(UserService);
  //seed the role  table if you need
  if (process.env.SEED_ROLES) {
    await seedRoles(roleService);
  }

  if (process.env.USERS_ARRAY.length !== 0) {
    await seedUsers(userService);
  }
  app.use(cookieParser());
  await app.listen(5000);
}

bootstrap();
