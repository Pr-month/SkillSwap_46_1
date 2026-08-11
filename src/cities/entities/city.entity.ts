import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn
} from 'typeorm';

@Entity('city')
@Index(['name', 'subject'])
export class City {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  district: string;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'int' })
  population: number;

  @Column({
    type: 'decimal',
    precision: 9,
    scale: 6,
    transformer: {
      to: (value: number) => value,
      from: (value: string | null) =>
        value === null ? null : Number(value),
    },
  })
  lat: number;

  @Column({
    type: 'decimal',
    precision: 9,
    scale: 6,
    transformer: {
      to: (value: number) => value,
      from: (value: string | null) =>
        value === null ? null : Number(value),
    },
  })
  lon: number;
}