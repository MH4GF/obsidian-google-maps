const PREFIX = '[Google Maps Import]'

export const logger = {
  debug: (...args: unknown[]): void => console.debug(PREFIX, ...args),
  warn: (...args: unknown[]): void => console.warn(PREFIX, ...args),
  error: (...args: unknown[]): void => console.error(PREFIX, ...args),
}
