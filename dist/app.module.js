"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const categories_module_1 = require("./categories/categories.module");
const subcategories_module_1 = require("./categories/subcategories/subcategories.module");
const db_config_1 = require("./config/db.config");
const jwt_config_1 = require("./config/jwt.config");
const favorites_module_1 = require("./favorites/favorites.module");
const gateway_module_1 = require("./gateway/gateway.module");
const configuration_module_1 = require("./module/configuration/configuration.module");
const configuration_service_1 = require("./module/configuration/configuration.service");
const env_validation_1 = require("./module/configuration/validation/env.validation");
const requests_module_1 = require("./requests/requests.module");
const skills_module_1 = require("./skills/skills.module");
const users_module_1 = require("./users/users.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            configuration_module_1.ConfigurationModule,
            config_1.ConfigModule.forRoot({
                validate: env_validation_1.validate,
                isGlobal: true,
            }),
            jwt_1.JwtModule.registerAsync({
                global: true,
                imports: [configuration_module_1.ConfigurationModule],
                inject: [configuration_service_1.ConfigurationService],
                useFactory: (configService) => {
                    const jwtConfig = (0, jwt_config_1.jwtConfigFactory)(configService);
                    return {
                        secret: jwtConfig.accessSecret,
                        signOptions: {
                            expiresIn: jwtConfig.accessExpiresIn,
                        },
                    };
                },
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [configuration_module_1.ConfigurationModule],
                inject: [configuration_service_1.ConfigurationService],
                useFactory: db_config_1.dbConfig,
            }),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            categories_module_1.CategoriesModule,
            subcategories_module_1.SubcategoriesModule,
            favorites_module_1.FavoritesModule,
            skills_module_1.SkillsModule,
            requests_module_1.RequestsModule,
            gateway_module_1.GatewayModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map