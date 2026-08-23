import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigurationService } from '../../module/configuration/configuration.service';
import { AuthenticatedSocket, SocketUser } from '../gateway.types';
export declare class WsJwtGuard implements CanActivate {
    private readonly jwtService;
    private readonly configurationService;
    constructor(jwtService: JwtService, configurationService: ConfigurationService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    authenticate(client: AuthenticatedSocket): Promise<SocketUser>;
    private extractAccessToken;
    private createWsException;
}
