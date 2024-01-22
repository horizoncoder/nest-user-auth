import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository} from "typeorm";
import * as bcrypt from 'bcryptjs'
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find({
            relations: ['role']
        });
    }
    async findOneByEmail(email: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: {
                email
            },
            relations: ['role']
        });

        if (!user) {
            throw new NotFoundException(`User  not found`);
        }
        return user;
    }
    async findOne(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where:{
                id
            },
            relations: ['role']
        });

        if (!user) {
            throw new NotFoundException(`User  not found`);
        }

        return user;
    }
    async isUserExist(email: string): Promise<boolean> {
        const user = await this.userRepository.findOne({
            where: {
                email
            },
        });

        return !!user;
    }

    async create(userData: any): Promise<any> {
        const user = this.userRepository.create(userData);
        return this.userRepository.save(user);
    }

    async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    }
    async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
}
