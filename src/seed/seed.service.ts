import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { SEED_ITEMS, SEED_USERS } from './data/seed-data';
import { UsersService } from 'src/users/users.service';
import { ItemsService } from 'src/items/items.service';

@Injectable()
export class SeedService {

    private isProd: boolean;

    constructor(
        private readonly configService: ConfigService,

        @InjectRepository(Item)
        private readonly itemsRepository: Repository<Item>,

        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,

        private readonly usersServices: UsersService,

        private readonly itemsServices: ItemsService,
    ) {

        this.isProd = this.configService.get('STATE') === 'prod';
    }

    async deleteDataBase() {
        await this.itemsRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();

        await this.usersRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();
    }

    async loadUser(): Promise<User[]> {
        const users = [];

        for (const user of SEED_USERS) {
            users.push(await this.usersServices.create(user))
        }

        return users;
    }

    async loadItems(user: User): Promise<Item[]> {
        const items = [];

        for (const item of SEED_ITEMS) {
            items.push(await this.itemsServices.create(item, user))
        }

        return items;
    }

    async executeSeed() {

        if (this.isProd) {
            throw new UnauthorizedException('We cannot run SEED on Prod');
        }
        //Limpiar la base de datos
        await this.deleteDataBase();

        //Crear usuarios
        const user = await this.loadUser();

        //Crear Items
        await this.loadItems(user[0]);

        return true;
    }

}
