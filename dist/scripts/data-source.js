"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
exports.getAppDataSource = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const typeorm_1 = require("typeorm");
const db_config_1 = require("../config/db.config");
const configuration_module_1 = require("../module/configuration/configuration.module");
const configuration_service_1 = require("../module/configuration/configuration.service");
const env_validation_1 = require("../module/configuration/validation/env.validation");
let ConfigBootstrapModule = class ConfigBootstrapModule {
};
ConfigBootstrapModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ validate: env_validation_1.validate, isGlobal: true }),
            configuration_module_1.ConfigurationModule,
        ],
    })
], ConfigBootstrapModule);
function createDataSource() {
    return __awaiter(this, void 0, void 0, function* () {
        const context = yield core_1.NestFactory.createApplicationContext(ConfigBootstrapModule, { logger: false });
        const configurationService = context.get(configuration_service_1.ConfigurationService);
        const options = (0, db_config_1.dbConfig)(configurationService);
        yield context.close();
        return new typeorm_1.DataSource(options);
    });
}
exports.getAppDataSource = createDataSource;
//# sourceMappingURL=data-source.js.map