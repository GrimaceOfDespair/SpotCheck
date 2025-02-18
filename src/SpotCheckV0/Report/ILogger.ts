export interface ILogger {
    info(message?: any): void;
    error(message?: any): void;
}

export const NullLogger: ILogger = {
    /* istanbul ignore next */
    info: (_) => {},
    /* istanbul ignore next */
    error: (_) => {},
}