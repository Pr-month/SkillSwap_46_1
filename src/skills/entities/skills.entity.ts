import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, ManyToOne } from 'typeorm';

import { Favorite } from './favorite.entity';

@Entity('skill')
export class Skill {
  @OneToMany(() => Favorite, (favorite) => favorite.skill)
    favoritedBy!: Favorite[];
}