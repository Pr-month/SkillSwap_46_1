import { FindOptionsRelations, FindOptionsSelect } from 'typeorm';

import { Request } from './entities/request.entity';

export const REQUEST_RELATIONS: FindOptionsRelations<Request> = {
  sender: true,
  receiver: true,
  offeredSkill: true,
  requestedSkill: true,
};

export const PUBLIC_REQUEST_FIELDS: FindOptionsSelect<Request> = {
  id: true,
  createdAt: true,
  status: true,
  isRead: true,
  sender: {
    id: true,
    name: true,
    about: true,
    birthdate: true,
    city: true,
    gender: true,
    avatar: true,
  },
  receiver: {
    id: true,
    name: true,
    about: true,
    birthdate: true,
    city: true,
    gender: true,
    avatar: true,
  },
  offeredSkill: {
    id: true,
    title: true,
    description: true,
    images: true,
    categoryId: true,
    subcategoryId: true,
    ownerId: true,
    createdAt: true,
    updatedAt: true,
  },
  requestedSkill: {
    id: true,
    title: true,
    description: true,
    images: true,
    categoryId: true,
    subcategoryId: true,
    ownerId: true,
    createdAt: true,
    updatedAt: true,
  },
};
