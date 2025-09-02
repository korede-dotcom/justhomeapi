import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithoutRequest] | [opt: import("passport-jwt").StrategyOptionsWithRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(config: ConfigService);
    validate(payload: any): Promise<{
        userId: any;
        username: any;
        role: any;
        shopId: any;
    }>;
}
export {};
