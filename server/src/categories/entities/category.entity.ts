import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Skill } from '../../skills/entities/skills.entity';
import { Subcategory } from './subcategory.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name!: string;

  @OneToMany(() => Subcategory, (subcategory) => subcategory.category)
  subcategories!: Subcategory[];

  @OneToMany(() => Skill, (skill) => skill.category)
  skills!: Skill[];
}
