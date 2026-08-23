"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const model_1 = require("../model");
function validate(config) {
    const variables = (0, class_transformer_1.plainToClass)(model_1.EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });
    const errors = (0, class_validator_1.validateSync)(variables, {
        skipMissingProperties: false,
    });
    if (errors.length) {
        const errorCount = errors.length;
        console.log(`Found ${errorCount} errors`);
        for (const error of errors) {
            console.log('Property', error.property, 'received value', error.value);
            if (!error.constraints) {
                continue;
            }
            for (const constraint of Object.keys(error.constraints)) {
                console.log(' - ', error.constraints[constraint]);
            }
        }
        throw new Error(`Validation is not successful`);
    }
    return variables;
}
//# sourceMappingURL=env.validation.js.map