const LEVELS = { debug: 0, info: 1, warn: 2, error: 3, none: 4 };
let currentLevel = typeof process !== 'undefined' && process.env?.NODE_ENV === 'production' ? 'warn' : 'debug';
export function setLogLevel(level) {
    currentLevel = level;
}
function createMethod(level, consoleFn) {
    return (...args) => {
        if (LEVELS[currentLevel] > LEVELS[level])
            return;
        if (args.length > 0 &&
            typeof args[0] === 'object' &&
            args[0] !== null &&
            !(args[0] instanceof Error)) {
            const ctx = args[0];
            const rest = args.slice(1);
            consoleFn(`[${level.toUpperCase()}]`, ...rest, ctx);
        }
        else {
            consoleFn(`[${level.toUpperCase()}]`, ...args);
        }
    };
}
const defaultLogger = {
    debug: createMethod('debug', console.log),
    info: createMethod('info', console.log),
    warn: createMethod('warn', console.warn),
    error: createMethod('error', console.error)
};
let activeLogger = defaultLogger;
export function setLogger(logger) {
    activeLogger = logger;
}
export const cmsLogger = {
    debug: (...args) => activeLogger.debug(...args),
    info: (...args) => activeLogger.info(...args),
    warn: (...args) => activeLogger.warn(...args),
    error: (...args) => activeLogger.error(...args)
};
