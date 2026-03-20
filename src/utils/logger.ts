const logger = {
  info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
  error: (error: Error | string, message?: string) => {
    if (typeof error === 'string') {
      console.error(`[ERROR] ${error} ${message || ''}`);
    } else {
      console.error(`[ERROR] ${message || ''}`, error);
    }
  },
};

export default logger;
