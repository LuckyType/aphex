export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';
export interface Logger {
    debug(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
}
export declare function setLogLevel(level: LogLevel): void;
export declare function setLogger(logger: Logger): void;
export declare const cmsLogger: Logger;
//# sourceMappingURL=logger.d.ts.map