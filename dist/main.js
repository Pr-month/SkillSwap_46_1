"use strict";
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
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const configuration_service_1 = require("./module/configuration/configuration.service");
const cookieParser = require("cookie-parser");
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = yield core_1.NestFactory.create(app_module_1.AppModule);
        app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
        app.use(cookieParser());
        app.useGlobalPipes(new common_1.ValidationPipe({
            forbidNonWhitelisted: true,
            transform: true,
            whitelist: true,
        }));
        app.useGlobalInterceptors(new common_1.ClassSerializerInterceptor(app.get(core_1.Reflector)));
        app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor());
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle('SkillSwap API')
            .setDescription('API для платформы обмена навыками SkillSwap')
            .setVersion('1.0')
            .addCookieAuth('accessToken', undefined, 'accessToken')
            .build();
        const documentFactory = () => swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup('docs', app, documentFactory);
        const configService = app.get(configuration_service_1.ConfigurationService);
        const port = configService.port || 8080;
        yield app.listen(port);
        console.log(`Application is running on: ${yield app.getUrl()}`);
    });
}
bootstrap();
//# sourceMappingURL=main.js.map