const logger = {
  info: (message: string, ...args: unknown[]) => console.log(`[INFO] ${message}`, ...args),
  warn: (message: string, ...args: unknown[]) => console.warn(`[WARN] ${message}`, ...args),
  error: (error: unknown, message?: string) => {
    if (typeof error === 'string') {
      console.error(`[ERROR] ${error} ${message || ''}`);
    } else if (error instanceof Error) {
      console.error(`[ERROR] ${message || ''}`, error);
    } else {
      console.error(`[ERROR] ${message || ''}`, error);
    }
  },
};

export default logger;
