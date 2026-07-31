import {
  Entity,
  Unique,
  Index,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Skill } from './skills.entity';

@Entity('favorites')
@Unique(['userId', 'skillId'])
@Index(['userId'])
@Index(['skillId'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @ManyToOne(() => User, (user) => user.favorites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column('uuid')
  skillId!: string;

  @ManyToOne(() => Skill, (skill) => skill.favoritedBy, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'skillId' })
  skill!: Skill;

  @CreateDateColumn()
  createdAt!: Date;
}
