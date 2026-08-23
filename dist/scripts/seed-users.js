"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = __importStar(require("bcrypt"));
const process = __importStar(require("process"));
const const_1 = require("../module/configuration/const");
const user_entity_1 = require("../users/entities/user.entity");
const data_source_1 = require("./data-source");
const admin_data_1 = require("./data/admin.data");
function seed() {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.env.NODE_ENV !== const_1.nodeEnvValue.Development) {
            console.log(`Сидинг разрешён только в среде "${const_1.nodeEnvValue.Development}". ` +
                `Текущая среда: "${process.env.NODE_ENV}"`);
            return;
        }
        const AppDataSource = yield (0, data_source_1.getAppDataSource)();
        yield AppDataSource.initialize();
        const userRepo = AppDataSource.getRepository(user_entity_1.User);
        const existingAdmin = yield userRepo.findOne({
            where: { email: admin_data_1.adminSeedData.email },
        });
        if (existingAdmin) {
            console.log('Администратор уже существует, сидинг пропущен');
            yield AppDataSource.destroy();
            return;
        }
        const saltRounds = Number(process.env.HASH_SALT) || 10;
        const hashedPassword = yield bcrypt.hash(admin_data_1.adminSeedData.password, saltRounds);
        const admin = yield userRepo.save(userRepo.create(Object.assign(Object.assign({}, admin_data_1.adminSeedData), { password: hashedPassword })));
        console.log(`Сид администратора успешно выполнен: ${admin.email}`);
        yield AppDataSource.destroy();
    });
}
seed().catch((e) => {
    console.error('Ошибка при сидировании администратора:', e);
    process.exit(1);
});
//# sourceMappingURL=seed-users.js.map