import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Category } from './category.entity';

@Entity('subcategories')
@Unique('UQ_subcategories_category_name', ['categoryId', 'name'])
export class Subcategory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Index()
  @Column({ name: 'category_id', type: 'uuid' })
  @IsUUID()
  categoryId!: string;

  @ManyToOne(() => Category, (category) => category.subcategories, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category!: Category;
}
