import { Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Favorite } from './favorite.entity';

@Entity('skill')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToMany(() => Favorite, (favorite) => favorite.skill)
  favoritedBy!: Favorite[];
}
