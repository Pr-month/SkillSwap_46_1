import {
  IsArray,
  isArray,
  IsOptional,
  isString,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Category } from '../../categories/entities/category.entity';
import { Subcategory } from '../../categories/entities/subcategory.entity';
import { User } from '../../users/entities/user.entity';
import { Favorite } from './favorite.entity';

@Entity('skill')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsString()
  @Column({ type: 'varchar', length: 100, nullable: false })
  title: string;

  @IsString()
  @Column({ type: 'varchar', length: 1000, nullable: false })
  description: string;

  @IsArray()
  @IsOptional()
  @Column({ type: 'text', array: true, nullable: true })
  images: string[];

  @Index()
  @Column({ name: 'category_id', type: 'uuid' })
  @IsUUID()
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.subcategories, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Index()
  @Column({ name: 'subcategory_id', type: 'uuid', nullable: true })
  @IsUUID()
  @IsOptional()
  subcategoryId: string;

  @ManyToOne(() => Subcategory, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'subcategory_id' })
  subcategory: Subcategory;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => User, (user) => user.skills)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Favorite, (favorite) => favorite.skill)
  favoritedBy!: Favorite[];
}
