"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PUBLIC_REQUEST_FIELDS = exports.REQUEST_RELATIONS = void 0;
exports.REQUEST_RELATIONS = {
    sender: true,
    receiver: true,
    offeredSkill: true,
    requestedSkill: true,
};
exports.PUBLIC_REQUEST_FIELDS = {
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
//# sourceMappingURL=requests.select.js.map