"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
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
exports.NotificationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const ws_jwt_guard_1 = require("./guards/ws-jwt.guard");
const PING_INTERVAL_MS = 25000;
const PING_TIMEOUT_MS = 20000;
let NotificationsGateway = class NotificationsGateway {
    constructor(wsJwtGuard) {
        this.wsJwtGuard = wsJwtGuard;
        this.connections = new Map();
    }
    handleConnection(client) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.wsJwtGuard.authenticate(client);
                yield client.join(this.getUserRoom(user.id));
                this.addConnection(user.id, client.id);
            }
            catch (_a) {
                client.disconnect(true);
            }
        });
    }
    handleDisconnect(client) {
        var _a;
        const userId = (_a = client.data.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return;
        }
        this.removeConnection(userId, client.id);
    }
    notifyUser(userId, event, payload) {
        if (!this.isUserOnline(userId)) {
            return false;
        }
        this.server.to(this.getUserRoom(userId)).emit(event, payload);
        return true;
    }
    isUserOnline(userId) {
        return this.connections.has(userId);
    }
    getConnectedUserIds() {
        return [...this.connections.keys()];
    }
    addConnection(userId, socketId) {
        var _a;
        const userConnections = (_a = this.connections.get(userId)) !== null && _a !== void 0 ? _a : new Set();
        userConnections.add(socketId);
        this.connections.set(userId, userConnections);
    }
    removeConnection(userId, socketId) {
        const userConnections = this.connections.get(userId);
        if (!userConnections) {
            return;
        }
        userConnections.delete(socketId);
        if (userConnections.size === 0) {
            this.connections.delete(userId);
        }
    }
    getUserRoom(userId) {
        return `user:${userId}`;
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
exports.NotificationsGateway = NotificationsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/notifications',
        pingInterval: PING_INTERVAL_MS,
        pingTimeout: PING_TIMEOUT_MS,
        cors: {
            origin: true,
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [ws_jwt_guard_1.WsJwtGuard])
], NotificationsGateway);
//# sourceMappingURL=notifications.gateway.js.map