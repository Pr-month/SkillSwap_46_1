import { Entity, OneToMany } from 'typeorm';
import { Favorite } from '../../skills/entities/favorite.entity';
@Entity('user')
export class User {
  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites!: Favorite[];
}
