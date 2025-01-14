export interface ILogger {
    info(message?: any): void;
    error(message?: any): void;
}

export const NullLogger: ILogger = {
    info: (_) => {},
    error: (_) => {},
}