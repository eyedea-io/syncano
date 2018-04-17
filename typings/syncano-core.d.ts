export interface Logger {
  warn: (...messages: any[]) => undefined;
  debug: (...messages: any[]) => undefined;
  info: (...messages: any[]) => undefined;
  error: (...messages: any[]) => undefined;
  listen: (callback: (event: Object) => undefined) => undefined;
}
