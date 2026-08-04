import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Skill } from '../../skills/entities/skills.entity';
import { User } from '../../users/entities/user.entity';
import { RequestStatus } from '../enums/request-status.enum';

@Entity('requests')
@Index('IDX_requests_status', ['status'])
@Index('IDX_requests_sender_status', ['sender', 'status'])
@Index('IDX_requests_receiver_status', ['receiver', 'status'])
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @ManyToOne(() => Skill, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'offeredSkillId' })
  offeredSkill: Skill;

  @ManyToOne(() => Skill, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'requestedSkillId' })
  requestedSkill: Skill;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;
}
