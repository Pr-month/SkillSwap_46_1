import { Strategy } from 'passport-jwt';
import { ConfigurationService } from '../../module/configuration/configuration.service';
import { JwtPayload } from '../auth.types';
declare const JwtRefreshStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtRefreshStrategy extends JwtRefreshStrategy_base {
    constructor(configurationService: ConfigurationService);
    validate(payload: JwtPayload): {
        id: string;
        email: string;
    };
}
export {};
