import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { IsNotEmpty, IsString } from 'class-validator';

@Entity('skill_categories')
export class SkillCategory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
  @Column({ type: 'varchar', length: 255 })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ManyToOne(() => SkillCategory, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent!: SkillCategory | null;

  @OneToMany(() => SkillCategory, (category) => category.parent)
  children!: SkillCategory[];
}
