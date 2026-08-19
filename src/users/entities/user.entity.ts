import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { Category } from '../../categories/entities/category.entity';
import { City } from '../../cities/entities/city.entity';
import { Favorite } from '../../skills/entities/favorite.entity';
import { Skill } from '../../skills/entities/skills.entity';
import { UserGender, UserRole } from '../enums/user.enums';

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

  @ManyToOne(() => City, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cityId' })
  city: Relation<City>;

  @Column({ type: 'uuid' })
  cityId: string;

  @Column({ type: 'enum', enum: UserGender })
  gender: UserGender;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  avatar: string | null;

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Relation<Favorite>[];

  @OneToMany(() => Skill, (skill) => skill.owner)
  skills: Relation<Skill>[];

  @ManyToMany(() => Category)
  @JoinTable({ name: 'user_want_to_learn' })
  wantToLearn: Relation<Category>[];

  @ManyToMany(() => Skill)
  @JoinTable({ name: 'user_favorite_skills' })
  favoriteSkills: Relation<Skill>[];

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt: Date;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Exclude()
  @Column({ type: 'varchar', length: 500, nullable: true })
  refreshToken: string | null;
}
