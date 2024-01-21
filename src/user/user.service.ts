// user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository} from "typeorm";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }
    async findOneByEmail(email: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: {
                email
            },
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
            }
        });

        if (!user) {
            throw new NotFoundException(`User  not found`);
        }

        return user;
    }

    async create(userData: Partial<User>): Promise<User> {
        const user = this.userRepository.create(userData);
        return this.userRepository.save(user);
    }
}
