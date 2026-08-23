"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminSeedData = void 0;
const user_enums_1 = require("../../users/enums/user.enums");
exports.adminSeedData = {
    email: (_a = process.env.ADMIN_EMAIL) !== null && _a !== void 0 ? _a : 'admin@skillswap.local',
    password: (_b = process.env.ADMIN_PASSWORD) !== null && _b !== void 0 ? _b : 'Admin12345',
    name: 'Администратор',
    birthdate: new Date('2000-01-01'),
    city: 'Москва',
    gender: user_enums_1.UserGender.OTHER,
    role: user_enums_1.UserRole.ADMIN,
};
//# sourceMappingURL=admin.data.js.map