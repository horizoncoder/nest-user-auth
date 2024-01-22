import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { RoleService } from './role/role.service';
import * as cookieParser from 'cookie-parser';
import { UserRoleEnum } from './enums/role.enum';

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

  //seed the role  table if you need
  if (process.env.SEED_ROLES) {
    await seedRoles(roleService);
  }
  app.use(cookieParser());
  await app.listen(5000);
}

bootstrap();
