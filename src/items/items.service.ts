import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemInput, UpdateItemInput } from './dto/inputs';
import { Item } from './entities/item.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ItemsService {

  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>
  ) { }

  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    const newItem = this.itemsRepository.create({ ...createItemInput, user: user });
    return await this.itemsRepository.save(newItem);
  }

  async findAll(): Promise<Item[]> {
    //Todo: filtrar, paginar, etc
    return await this.itemsRepository.find();
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.itemsRepository.findOneBy({ id });
    if (!item) throw new NotFoundException(`Item with id ${id} dont exist`);
    return item;
  }

  async update(id: string, updateItemInput: UpdateItemInput): Promise<Item> {
    const item = await this.itemsRepository.preload(updateItemInput);

    if (!item) throw new NotFoundException(`Item with id ${id} dont exist`);

    return this.itemsRepository.save(item);
  }

  async remove(id: string): Promise<Item> {
    //TODO sof delete, integridad referencial
    const item = await this.findOne(id);
    await this.itemsRepository.remove(item);
    return { ...item, id }
  }
}
