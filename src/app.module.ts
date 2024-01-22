import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import {RoleModule} from "./role/role.module";
import {UserModule} from "./user/user.module";
import {AuthService} from "./auth/auth.service";
import {AuthModule} from "./auth/auth.module";

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    RoleModule,
    UserModule,
    AuthModule
  ],
})
export class AppModule {}
