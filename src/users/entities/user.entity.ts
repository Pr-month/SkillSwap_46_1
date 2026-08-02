import { Exclude } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Favorite } from '../../skills/entities/favorite.entity';
import { UserGender, UserRole } from '../enums/user.enums';
import { Skill } from '../../skills/entities/skills.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'text', nullable: true })
  about: string | null;

  @Column({ type: 'date' })
  birthdate: Date;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'enum', enum: UserGender })
  gender: UserGender;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  avatar: string | null;

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @OneToMany('Skill', 'owner')
  skills: Relation<Skill>[];

  @ManyToMany('Category')
  @JoinTable({ name: 'user_want_to_learn' })
  wantToLearn: Relation<Category>[];

  @ManyToMany('Skill')
  @JoinTable({ name: 'user_favorite_skills' })
  favoriteSkills: Relation<Skill>[];

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Exclude()
  @Column({ type: 'varchar', length: 500, nullable: true })
  refreshToken: string | null;
}
